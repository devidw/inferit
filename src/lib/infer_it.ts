import { OpenAI } from "openai"
import { nodes, settings } from "./state.js"
import { get, type Writable } from "svelte/store"
import { edges } from "./state.js"
import type { Params } from "./types.js"
import toast from "svelte-french-toast"
import { build_prompt } from "./prompts.js"
import type { Node } from "@xyflow/svelte"

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

    out_id = await on_output({
      thread_id,
      src_id,
      status,
    })

    if (!out_id) {
      return
    }

    if (
      params.model === "Gemini Nano" ||
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

        on_output_chunk({
          id: out_id,
          status,
          text: only_chunk,
        })

        previous = chunk
      }

      local_llm.destroy()
    } else {
      const api_client = new OpenAI({
        baseURL: settings_snapshot.base_url,
        apiKey: settings_snapshot.api_key,
        dangerouslyAllowBrowser: true,
      })

      if (settings_snapshot.endpoint === "completions") {
        const stream = await api_client.completions.create({
          ...params,
          stop: [params.stop === "\\n" ? "\n" : ""],
          stream: true,
        })

        for await (const chunk of stream) {
          // console.info({ chunk })

          on_output_chunk({
            id: out_id,
            status,
            text: chunk.choices[0].text,
          })
        }
      } else if (settings_snapshot.endpoint === "chat") {
        delete (params as { prompt?: any }).prompt

        const stream = await api_client.chat.completions.create({
          ...params,
          stop: [params.stop === "\\n" ? "\n" : ""],
          stream: true,
          // @ts-ignore
          messages: prompt_build.messages.map((msg) => {
            return {
              role: role_map[msg.role],
              content: msg.content,
            }
          }),
        })

        for await (const chunk of stream) {
          // console.info({ chunk })

          const text = chunk.choices[0].delta.content

          if (text === null || text === undefined) {
            continue
          }

          on_output_chunk({
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
      on_output_chunk({
        id: out_id,
        status,
      })
    }
  }
}

async function on_output({
  thread_id,
  src_id,
  status,
}: {
  thread_id: string
  src_id: string
  status: Writable<"idle" | "busy">
}) {
  const next_bot_node_id = String(Date.now())

  const src_node = get(nodes).find((node) => node.id === src_id)
  // console.info({ src_node })

  if (!src_node) {
    return
  }

  nodes.update((the_nodes) => {
    const node: Node = {
      id: next_bot_node_id,
      type: "custom-bot-node",
      data: {
        thread_id: thread_id,
        src_id,
        id: next_bot_node_id,
        content: "",
        content_chunks: [],
        status: get(status),
      },
      position: {
        x: src_node.position.x + 50 * Math.random(),
        y:
          src_node.position.y +
          (src_node.measured?.height ?? 0.1) +
          50 * Math.random(),
      },
    }

    the_nodes.push(node)

    return the_nodes
  })

  edges.update((the_edges) => {
    the_edges.push({
      id: String(Math.random()),
      source: src_id,
      target: next_bot_node_id,
    })

    return the_edges
  })

  return next_bot_node_id
}

function on_output_chunk({
  id,
  status,
  text,
}: {
  id: string
  status: Writable<unknown>
  text?: string
}) {
  nodes.update((the_nodes) => {
    const node = the_nodes.find((node) => node.id === id)

    if (node) {
      node.data.status = get(status)

      if (text) {
        node.data.content += text

        if (!Array.isArray(node.data.content_chunks)) {
          node.data.content_chunks = []
        } else {
          node.data.content_chunks = [...node.data.content_chunks, text]
        }
      }
    }

    return the_nodes
  })
}
