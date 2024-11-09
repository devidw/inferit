<script lang="ts">
  import { Handle, Position, type Node } from "@xyflow/svelte"
  import { nodes, edges, add_user_node } from "./state.js"
  import DropBtn from "./drop_btn.svelte"
  import NextBtn from "./next_btn.svelte"
  import { useSvelteFlow } from "@xyflow/svelte"
  import Markdown from "svelte-markdown"

  let {
    data,
  }: {
    data: {
      thread_id: string
      src_id: string
      id: string
      status: "idle" | "busy"
    }
  } = $props()

  let content = $derived(
    $nodes.find((node) => node.id === data.id)?.data.content ?? data.content
  )

  let content_chunks: string[] = $derived(
    $nodes.find((node) => node.id === data.id)?.data.content_chunks ?? []
  )

  let status = $derived(
    $nodes.find((node) => node.id === data.id)?.data.status ?? "idle"
  ) as "idle" | "busy"

  // $effect(() => {
  //   console.info(status)
  // })

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

  let md_render = $state(true)
</script>

<div
  class="box relative bg-stone-9 border-1 border-dashed font-mono text-xs px4 py2
rounded-lg text-stone-3 {status === 'busy' ? 'border-cyan' : 'border-stone-6'}"
>
  <!-- <div>bot {data.id}</div> -->

  <Handle type="target" position={Position.Top} />
  <Handle type="source" position={Position.Bottom} />

  <DropBtn {drop_me} />

  <NextBtn func={on_next} />

  <button
    type="button"
    onclick={() => {
      md_render = !md_render
    }}
    aria-label="fork"
    class="bg-stone-6 rounded-full absolute top-14px -left-8px z-1
  w-16px h-16px flex justify-center items-center text-xs rotate-90"
  >
    {#if md_render}
      <div class="i-eva:toggle-right-outline"></div>
    {:else}
      <div class="i-eva:toggle-left-outline"></div>
    {/if}
  </button>

  <!-- <pre class="w-300px whitespace-pre-wrap">{content}</pre> -->

  <!-- <hr /> -->

  <div class="w-400px whitespace-pre-wrap">
    {#if content_chunks.length === 0}
      <span
        class={status === "busy" ? "outline-dashed outline-cyan text-cyan" : ""}
        >&nbsp;</span
      >
    {:else if md_render}
      <div class="markdown-body">
        <Markdown source={content} />
      </div>
    {:else}
      {#each content_chunks as chunk, index}
        <span
          class="hover:outline-dashed outline-cyan {status === 'busy' &&
          index + 1 === content_chunks.length &&
          chunk.length > 0
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
