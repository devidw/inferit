import { get } from "svelte/store"
import { nodes } from "./state.js"
import type { Node } from "@xyflow/svelte"

/**
 * - system node    data.params.prompt
 * - bot node       data.content
 * - user node      data.content
 *
 * go the tree up and combine a prompt based on each node's text portion
 */
export function build_prompt({ node_id }: { node_id: string }) {
  const nodes_snapshot = get(nodes)
  const thread_nodes: Node[] = []

  const start_node = nodes_snapshot.find((node) => node.id === node_id)

  if (!start_node) {
    return
  }

  thread_nodes.push(start_node)

  let current_node = start_node

  while (current_node.data.src_id) {
    const next_node_id = current_node.data.src_id as string

    const next_node = nodes_snapshot.find((node) => node.id === next_node_id)

    if (!next_node) {
      break
    }

    thread_nodes.push(next_node)

    current_node = next_node
  }

  const messages: { role: "system" | "user" | "bot"; content: string }[] = []

  for (const thread_node of thread_nodes) {
    switch (thread_node.type) {
      case "custom-system-node": {
        messages.push({
          role: "system",
          content: thread_node.data.params.prompt,
        })
        break
      }
      case "custom-user-node": {
        messages.push({
          role: "user",
          content: thread_node.data.content,
        })
        break
      }
      case "custom-bot-node": {
        messages.push({
          role: "bot",
          content: thread_node.data.content,
        })
        break
      }
      default: {
        break
      }
    }
  }

  const the_prompt =
    messages
      .reverse()
      .map((msg) => {
        switch (msg.role) {
          case "system": {
            return msg.content
          }
          case "user":
          case "bot": {
            return `${msg.role}: ${msg.content}`
          }
        }
      })
      .join("\n") + "\nbot:"

  console.info({
    thread_nodes,
    the_prompt,
  })

  return the_prompt
}
