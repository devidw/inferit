import { get, type Writable, writable } from "svelte/store"
import { type Edge, type Node } from "@xyflow/svelte"
import { tick } from "svelte"
import toast from "svelte-french-toast"
import { default_settings, type Settings } from "./types.js"

export const is_online = writable(navigator.onLine)

function on_net_change() {
  is_online.set(navigator.onLine)
}

window.addEventListener("online", on_net_change)
window.addEventListener("offline", on_net_change)

export const settings = writable<Settings>(Object.assign({}, default_settings))

export const nodes: Writable<Node[]> = writable([])
export const edges: Writable<Edge[]> = writable([])

export const model_names = ["Gemini Nano"]

function init_from_local({
  key,
  the_store,
  default_value,
}: {
  key: string
  the_store: Writable<unknown>
  default_value?: object
}) {
  const locals = localStorage.getItem(key)

  if (!locals) {
    return
  }

  try {
    const read = JSON.parse(locals)

    if (default_value) {
      the_store.set({
        ...(default_value ?? {}),
        ...read,
      })
    } else {
      the_store.set(read)
    }
  } catch (e) {
    console.error(e)
    toast.error(e instanceof Error ? e.message : "Error during state recovery")
  }
}

init_from_local({
  key: "settings",
  the_store: settings,
  default_value: default_settings,
})
init_from_local({ key: "nodes", the_store: nodes })
init_from_local({ key: "edges", the_store: edges })

settings.subscribe((the_settings) => {
  localStorage.setItem("settings", JSON.stringify(the_settings))
})

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

export function add_system_node(data?: Record<string, unknown>) {
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

  // console.info({ latest_input })

  setTimeout(() => {
    if (!latest_input) {
      return
    }

    latest_input.focus()
  })
}
