import { OpenAI } from "openai"
import { nodes, settings } from "./state.js"
import { get, type Writable } from "svelte/store"
import { browser_backend_name, type Params } from "./types.js"
import toast from "svelte-french-toast"
import { build_prompt } from "./prompts.js"
import { add_bot_node, update_bot_node } from "./nodes.js"

const role_map = {
  system: "system",
  user: "user",
  bot: "assistant",
}

export async function infer_it({
  thread_id,
  src_id,
  status,
}: {
  thread_id: string
  src_id: string
  status: Writable<"idle" | "busy">
}) {
  const settings_snapshot = get(settings)

  let out_id: string | undefined = undefined

  try {
    status.set("busy")

    const thread_node = get(nodes).find((node) => node.id === thread_id)

    if (!thread_node) {
      return
    }

    const prompt_build = build_prompt({
      node_id: src_id,
    })

    if (!prompt_build) {
      return
    }

    let params: Params = Object.assign({}, thread_node.data.params) as Params

    // delete (params as Params & { prompt?: string }).prompt

    out_id = await add_bot_node({
      thread_id,
      src_id,
      status,
    })

    if (!out_id) {
      return
    }

    if (
      params.backend === browser_backend_name ||
      (!navigator.onLine && settings_snapshot.browser_ai_offline_fallback)
    ) {
      if (!window.ai.languageModel) {
        throw new Error("browser ai not available")
      }

      // const messages = [...prompt_build.messages]

      // const sys_msg = messages.shift()!

      const local_llm = await window.ai.languageModel.create({
        temperature: params.temperature,
        topK: params.top_k,
        // systemPrompt: sys_msg.content,
      })

      // console.info({
      //   sys_msg,
      //   messages,
      // })

      const stream = local_llm.promptStreaming(
        // @ts-ignore
        // messages.map((msg) => {
        //   return {
        //     role: msg.role === "bot" ? "assistant" : "user",
        //     content: msg.content,
        //   }
        // }),
        prompt_build.the_prompt
      )

      let previous = ""

      for await (const chunk of stream) {
        let only_chunk = chunk.replace(previous, "")

        update_bot_node({
          id: out_id,
          status,
          text: only_chunk,
        })

        previous = chunk
      }

      local_llm.destroy()
    } else {
      const backend = settings_snapshot.backends.find(
        (backend) => backend.base_url === params.backend
      )

      if (!backend) {
        throw new Error(`backend '${params.backend}' not found in settings`)
      }

      const api_client = new OpenAI({
        baseURL: backend.base_url,
        apiKey: backend.api_key,
        dangerouslyAllowBrowser: true,
        defaultHeaders:
          backend.base_url === "https://openrouter.ai/api/v1"
            ? {
                "http-referer": "https://inferit.index.garden",
                "x-title": "inferit",
              }
            : {},
      })

      if (settings_snapshot.endpoint === "completions") {
        const stream = await api_client.completions.create({
          stream: true,

          prompt: prompt_build.the_prompt,

          model: params.model,

          max_tokens: params.max_tokens,
          stop:
            params.stop === "\\n"
              ? ["\n"]
              : params.stop === ""
                ? []
                : [params.stop],

          temperature: params.temperature,
          min_p: params.min_p,

          top_p: params.top_p,
          top_k: params.top_k,
        })

        for await (const chunk of stream) {
          // console.info({ chunk })

          update_bot_node({
            id: out_id,
            status,
            text: chunk.choices[0].text,
          })
        }
      } else if (settings_snapshot.endpoint === "chat") {
        delete (params as { prompt?: any }).prompt

        const stream = await api_client.chat.completions.create({
          stream: true,

          // @ts-ignore
          messages: prompt_build.messages.map((msg) => {
            return {
              role: role_map[msg.role],
              content: msg.content,
            }
          }),

          model: params.model,

          max_tokens: params.max_tokens,
          stop:
            params.stop === "\\n"
              ? ["\n"]
              : params.stop === ""
                ? []
                : [params.stop],

          temperature: params.temperature,
          min_p: params.min_p,

          top_p: params.top_p,
          top_k: params.top_k,
        })

        for await (const chunk of stream) {
          // console.info({ chunk })

          const text = chunk.choices[0].delta.content

          if (text === null || text === undefined) {
            continue
          }

          update_bot_node({
            id: out_id,
            status,
            text,
          })
        }
      }
    }
  } catch (e) {
    toast.error(e instanceof Error ? e.message : JSON.stringify(e))

    console.error(e)
  } finally {
    status.set("idle")

    if (out_id) {
      update_bot_node({
        id: out_id,
        status,
      })
    }
  }
}
