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

async function on_output({
  id,
  output,
  type,
}: {
  id: string
  output: string
  type: "error" | "success"
}) {
  const new_id = String(Date.now())

  const src_node = get(nodes).find((node) => node.id === id)
  console.info({ src_node })

  if (!src_node) {
    return
  }

  nodes.update((the_nodes) => {
    the_nodes.push({
      id: new_id,
      type: "custom-output",
      data: {
        id: new_id,
        content: output,
        type,
      },
      position: {
        x: src_node.position.x + 50 * Math.random(),
        y:
          src_node.position.y +
          (src_node.measured?.height ?? 0.1) +
          50 * Math.random(),
      },
    })

    return the_nodes
  })

  edges.update((the_edges) => {
    the_edges.push({
      id: String(Math.random()),
      source: id,
      target: new_id,
    })

    return the_edges
  })

  return new_id
}

function on_output_chunk({ id, text }: { id: string; text: string }) {
  nodes.update((the_nodes) => {
    const node = the_nodes.find((node) => node.id === id)

    if (node) {
      node.data.content += text
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
