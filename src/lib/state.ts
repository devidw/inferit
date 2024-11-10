import { get, type Writable, writable } from "svelte/store"
import { type Edge, type Node } from "@xyflow/svelte"
import { tick } from "svelte"

type Settings = {
  base_url: string
  api_key: string
}

export const settings = writable<Settings>({
  base_url: "",
  api_key: "",
})

export const nodes: Writable<Node[]> = writable([])
export const edges: Writable<Edge[]> = writable([])

export const model_names = ["Gemini Nano"]

function init_from_local({
  key,
  the_store,
}: {
  key: string
  the_store: Writable<unknown>
}) {
  const locals = localStorage.getItem(key)

  if (!locals) {
    return
  }

  the_store.set(JSON.parse(locals))
}

init_from_local({ key: "settings", the_store: settings })
init_from_local({ key: "nodes", the_store: nodes })
init_from_local({ key: "edges", the_store: edges })

nodes.subscribe((the_nodes) => {
  localStorage.setItem("nodes", JSON.stringify(the_nodes))
})

edges.subscribe((the_edges) => {
  // todo: drop edges when nodes are dropped and this logic will become obsolete
  const nodes_snapshot = get(nodes)
  const node_ids = nodes_snapshot.map((node) => node.id)

  const filtered = the_edges.filter((edge) => {
    return node_ids.includes(edge.source) && node_ids.includes(edge.target)
  })

  localStorage.setItem("edges", JSON.stringify(filtered))
})

export async function on_output({
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

export function on_output_chunk({
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

export function add_node(data?: Record<string, unknown>) {
  const new_id = String(Date.now())

  nodes.update((the_nodes) => {
    the_nodes.push({
      id: new_id,
      type: "custom-system-node",
      position: { x: 50 * Math.random(), y: 50 * Math.random() },
      data: {
        ...data,
        id: new_id,
      },
    })

    return the_nodes
  })

  return new_id
}

export async function add_user_node({
  thread_id,
  src_id,
  id,
  e,
  cords_helper,
}: {
  thread_id: string
  src_id: string
  id: string
  e: MouseEvent
  cords_helper: (a: { x: number; y: number }) => { x: number; y: number }
}) {
  const out = cords_helper({
    x: e.pageX,
    y: e.pageY,
  })

  const src_node = get(nodes).find((node) => node.id === src_id)

  if (!src_node) {
    return
  }

  const next_user_node_id = String(Date.now())

  nodes.update((the_nodes) => {
    the_nodes.push({
      id: next_user_node_id,
      type: "custom-user-node",
      position: {
        x: src_node.position.x + 20,
        y: out.y + 20,
      },
      data: {
        thread_id: thread_id,
        src_id: id,
        id: next_user_node_id,
      },
    })

    return the_nodes
  })

  edges.update((the_edges) => {
    the_edges.push({
      id: `${id}_${next_user_node_id}`,
      source: id,
      target: next_user_node_id,
    })

    return the_edges
  })

  await tick()

  const latest_input: HTMLTextAreaElement | null = document.querySelector(
    // `textarea`
    `div[data-id="${next_user_node_id}"] textarea`
  )

  console.info({ latest_input })

  setTimeout(() => {
    if (!latest_input) {
      return
    }

    latest_input.focus()
  })
}
