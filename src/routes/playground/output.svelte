<script lang="ts">
  import { Handle, Position } from "@xyflow/svelte"
  import { nodes, edges } from "./state.js"
  import DropBtn from "./drop_btn.svelte"

  let {
    data,
  }: {
    data: {
      id: string
      content: string
      type: "error" | "success"
    }
  } = $props()

  let content = $derived(
    $nodes.find((node) => node.id === data.id)?.data.content ?? data.content
  )

  function drop_me() {
    $edges = $edges.filter((edge) => edge.target !== data.id)
    $nodes = $nodes.filter((node) => node.id !== data.id)
  }
</script>

<div
  class="box relative bg-stone-9 border-0.5 font-mono text-xs p2
rounded-lg text-stone-3 {data.type === 'error'
    ? 'border-red-9'
    : ''} {data.type === 'success' ? 'border-stone-5' : ''}"
>
  <Handle type="target" position={Position.Top} />

  <DropBtn {drop_me} />

  <pre class="w-300px whitespace-pre-wrap hypens-auto">{content}</pre>
</div>

<style>
  .box {
    box-shadow: 0 0 100px rgba(255, 102, 0, 0.15);
  }
</style>
