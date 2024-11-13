import { get } from "svelte/store"
import { nodes, settings } from "./state.js"
import type { Node } from "@xyflow/svelte"
import { default_params, type Params } from "./types.js"

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

  let params: Params = Object.assign({}, default_params)

  for (const thread_node of thread_nodes) {
    switch (thread_node.type) {
      case "custom-system-node": {
        params = thread_node.data.params as Params

        messages.push({
          role: "system",
          content: params.prompt,
        })

        break
      }
      case "custom-user-node": {
        messages.push({
          role: "user",
          content: thread_node.data.content as string,
        })
        break
      }
      case "custom-bot-node": {
        messages.push({
          role: "bot",
          content: thread_node.data.content as string,
        })
        break
      }
      default: {
        break
      }
    }
  }

  const settings_snapshot = get(settings)

  const the_prompt =
    messages
      .reverse()
      .map((msg) => {
        switch (msg.role) {
          case "system": {
            return `${msg.content}`
          }
          case "user": {
            return `${settings_snapshot.user_prefix}${msg.content}`
          }
          case "bot": {
            return `${settings_snapshot.bot_prefix}${msg.content}`
          }
        }
      })
      .join("\n") +
    (settings_snapshot.bot_prefix.length > 0
      ? `\n${settings_snapshot.bot_prefix}`
      : "")

  // console.info({
  //   thread_nodes,
  //   the_prompt,
  // })

  return {
    messages,
    the_prompt,
  }
}
