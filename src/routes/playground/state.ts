import { get, type Writable, writable } from "svelte/store"
import type { Edge, Node } from "@xyflow/svelte"
import { browser } from "$app/environment"

type Settings = {
  base_url: string
  api_key: string
}

export const settings = writable<Settings>({
  base_url: "",
  api_key: "",
})

function init_settings() {
  if (!browser) {
    return
  }

  const locals = localStorage.getItem("settings")

  if (!locals) {
    return
  }

  settings.set(JSON.parse(locals))
}

init_settings()

export const nodes: Writable<Node[]> = writable([])
export const edges: Writable<Edge[]> = writable([])

export const model_names = [
  "vicgalle/Roleplay-Llama-3-8B",
  "athirdpath/NSFW_DPO_Noromaid-7b",
]

export async function on_output({
  thread_id,
  src_id,
  output,
  type,
}: {
  thread_id: string
  src_id: string
  output: string
  type: "error" | "success"
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
        type,
        content: output,
        content_chunks: [],
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

export function on_output_chunk({ id, text }: { id: string; text: string }) {
  nodes.update((the_nodes) => {
    const node = the_nodes.find((node) => node.id === id)

    if (node) {
      node.data.content += text

      if (!Array.isArray(node.data.content_chunks)) {
        node.data.content_chunks = []
      } else {
        node.data.content_chunks = [...node.data.content_chunks, text]
      }
    }

    return the_nodes
  })
}

export function add_node(data?: Record<string, unknown>) {
  const new_id = String(Date.now())

  nodes.update((the_nodes) => {
    the_nodes.push({
      id: new_id,
      type: "custom-infer",
      position: { x: 50 * Math.random(), y: 50 * Math.random() },
      data: {
        ...data,
        id: new_id,
        on_output,
        on_output_chunk,
      },
    })

    return the_nodes
  })
}
