<script lang="ts">
  import { Handle, Position, type Node } from "@xyflow/svelte"
  import { nodes, edges, add_user_node } from "./state.js"
  import DropBtn from "./drop_btn.svelte"
  import NextBtn from "./next_btn.svelte"
  import { useSvelteFlow } from "@xyflow/svelte"

  let {
    data,
  }: {
    data: {
      thread_id: string
      src_id: string
      id: string
    }
  } = $props()

  // let content = $derived(
  //   $nodes.find((node) => node.id === data.id)?.data.content ?? data.content
  // )

  let content_chunks: string[] = $derived(
    $nodes.find((node) => node.id === data.id)?.data.content_chunks ?? []
  )

  function drop_me() {
    $nodes = $nodes.filter((node) => node.id !== data.id)
  }

  const { screenToFlowPosition } = useSvelteFlow()

  function on_next(e: MouseEvent) {
    add_user_node({
      thread_id: data.thread_id,
      src_id: data.src_id,
      id: data.id,
      e,
      cords_helper: screenToFlowPosition,
    })
  }
</script>

<div
  class="box relative bg-stone-9 border-1 border-dashed font-mono text-xs p2
rounded-lg text-stone-3 border-stone-6"
>
  <!-- <div>bot {data.id}</div> -->

  <Handle type="target" position={Position.Top} />
  <Handle type="source" position={Position.Bottom} />

  <DropBtn {drop_me} />

  <NextBtn func={on_next} />

  <!-- <pre class="w-300px whitespace-pre-wrap">{content}</pre> -->

  <!-- <hr /> -->

  <div class="w-300px whitespace-pre-wrap">
    {#if content_chunks.length === 0}
      <span class="outline-dashed outline-cyan text-cyan">&nbsp;</span>
    {:else}
      {#each content_chunks as chunk, index}
        <span
          class="hover:outline-dashed outline-cyan {index + 1 ===
            content_chunks.length && chunk.length > 0
            ? 'text-cyan outline-dashed'
            : ''}">{chunk}</span
        >
      {/each}
    {/if}
  </div>
</div>

<style>
  .box {
    box-shadow: 0 0 100px rgba(255, 102, 0, 0.15);
  }
</style>
