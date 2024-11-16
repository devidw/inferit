import { get, type Writable, writable } from "svelte/store"
import { type Edge } from "@xyflow/svelte"
import toast from "svelte-french-toast"
import { default_settings, type Our_Node, type Settings } from "./types.js"

export const is_online = writable(navigator.onLine)

function on_net_change() {
  is_online.set(navigator.onLine)
}

window.addEventListener("online", on_net_change)
window.addEventListener("offline", on_net_change)

export const settings = writable<Settings>(Object.assign({}, default_settings))

export const nodes: Writable<Our_Node[]> = writable([])
export const edges: Writable<Edge[]> = writable([])

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
