import { OpenAI } from "openai"
import { nodes, settings } from "./state.js"
import { get, type Writable } from "svelte/store"
import { on_output, on_output_chunk } from "./state.js"
import type { Params } from "./types.js"

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
  patch_params,
}: {
  thread_id: string
  src_id: string
  status: Writable<"idle" | "busy">
  patch_params?: (params: Params) => Params
}) {
  try {
    status.set("busy")

    const api_client = get_api_client()

    const thread_node = get(nodes).find((node) => node.id === thread_id)

    if (!thread_node) {
      return
    }

    let params: Params = thread_node.data.params as Params

    if (patch_params) {
      params = patch_params(params)
    }

    const stream = await api_client.completions.create({
      ...params,
      stop: [params.stop === "\\n" ? "\n" : ""],
      stream: true,
    })

    const out_id = await on_output({
      thread_id,
      src_id,
      output: "",
      type: "success",
    })

    if (!out_id) {
      return
    }

    for await (const chunk of stream) {
      on_output_chunk({
        id: out_id,
        text: chunk.choices[0].text,
      })
    }
  } catch (e) {
    await on_output({
      thread_id,
      src_id,
      output: e.message,
      type: "error",
    })

    console.error(e)
  } finally {
    status.set("idle")
  }
}