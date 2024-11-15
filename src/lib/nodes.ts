import { nodes, edges } from "./state.js"
import {
  default_params,
  default_param_syncs,
  type Our_Node,
  type Params,
  type Param_Key,
} from "./types.js"
import { get } from "svelte/store"
import { tick } from "svelte"
import type { Writable } from "svelte/store"

export function gen_id(prefix: string) {
  return `${prefix}_${window.crypto.randomUUID().replaceAll("-", "")}`
}

export function add_system_node(data?: {
  params: Params
  param_syncs: Param_Key[]
}) {
  const new_id = gen_id("sys")

  if (data === undefined) {
    data = {
      params: { ...default_params },
      param_syncs: [...default_param_syncs],
    }
  }

  // console.info({ clone_data: data })

  nodes.update((the_nodes) => {
    the_nodes.push({
      id: new_id,
      type: "custom-system-node",
      position: { x: 50 * Math.random(), y: 50 * Math.random() },
      data: {
        id: new_id,
        ...data,
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

  const next_user_node_id = gen_id("usr")

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

export async function add_bot_node({
  thread_id,
  src_id,
  status,
}: {
  thread_id: string
  src_id: string
  status: Writable<"idle" | "busy">
}) {
  const next_bot_node_id = gen_id("bot")

  const src_node = get(nodes).find((node) => node.id === src_id)
  // console.info({ src_node })

  if (!src_node) {
    return
  }

  nodes.update((the_nodes) => {
    const node: Our_Node = {
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

export function update_bot_node({
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
