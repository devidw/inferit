import { OpenAI } from "openai"
import { nodes, settings } from "./state.js"
import { get, type Writable } from "svelte/store"
import { on_output, on_output_chunk } from "./state.js"
import type { Params } from "./types.js"
import toast from "svelte-french-toast"

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
  the_prompt,
}: {
  thread_id: string
  src_id: string
  status: Writable<"idle" | "busy">
  the_prompt?: string
}) {
  try {
    status.set("busy")

    const api_client = get_api_client()

    const thread_node = get(nodes).find((node) => node.id === thread_id)

    if (!thread_node) {
      return
    }

    let params: Params = Object.assign({}, thread_node.data.params) as Params

    if (the_prompt) {
      params.prompt = the_prompt
    }

    const out_id = await on_output({
      thread_id,
      src_id,
      status,
    })

    const stream = await api_client.completions.create({
      ...params,
      stop: [params.stop === "\\n" ? "\n" : ""],
      stream: true,
    })

    if (!out_id) {
      return
    }

    for await (const chunk of stream) {
      // console.info({ chunk })

      on_output_chunk({
        id: out_id,
        text: chunk.choices[0].text,
      })
    }
  } catch (e) {
    toast.error(e instanceof Error ? e.message : JSON.stringify(e))

    console.error(e)
  } finally {
    status.set("idle")
  }
}
