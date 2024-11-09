import { OpenAI } from "openai"
import { nodes, settings } from "./state.js"
import { get, type Writable } from "svelte/store"
import { on_output, on_output_chunk } from "./state.js"
import type { Params } from "./types.js"
import toast from "svelte-french-toast"
import { build_prompt } from "./prompts.js"

export function get_api_client() {
  return new OpenAI({
    baseURL: get(settings).base_url,
    apiKey: get(settings).api_key,
    dangerouslyAllowBrowser: true,
  })
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
  let out_id: string | undefined = undefined

  try {
    status.set("busy")

    const api_client = get_api_client()

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

    params.prompt = prompt_build.the_prompt

    out_id = await on_output({
      thread_id,
      src_id,
      status,
    })

    if (!out_id) {
      return
    }

    if (params.model === "Gemini Nano") {
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
        params.prompt,
        {}
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
