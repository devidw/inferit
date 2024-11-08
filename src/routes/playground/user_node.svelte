<script lang="ts">
  import { Handle, Position } from "@xyflow/svelte"
  import { nodes, edges } from "./state.js"
  import DropBtn from "./drop_btn.svelte"
  import NextBtn from "./next_btn.svelte"
  import { infer_it } from "./infer_it.js"
  import { writable } from "svelte/store"
  import autosize from "svelte-autosize"

  let {
    data,
  }: {
    data: {
      thread_id: string
      src_id: string
      id: string
    }
  } = $props()

  const status = writable<"idle" | "busy">("idle")

  let content = $state("some new user message")

  function drop_me() {
    $nodes = $nodes.filter((node) => node.id !== data.id)
  }

  async function on_next() {
    const src_node = $nodes.find((node) => node.id === data.src_id)

    if (!src_node) {
      return
    }

    await infer_it({
      thread_id: data.thread_id,
      src_id: data.id,
      status,
      patch_params(params) {
        params.prompt += `${src_node.data.content}\nuser: ${content}\nbot:`
        return params
      },
    })
  }
</script>

<div
  class="box relative bg-stone-8 border-0.5 font-mono text-xs p2
  rounded-lg text-stone-3 border-stone-5"
>
  <!-- <div>user {data.id}</div> -->

  <Handle type="target" position={Position.Top} />
  <Handle type="source" position={Position.Bottom} />

  <DropBtn {drop_me} />

  <NextBtn func={on_next} />

  <textarea
    bind:value={content}
    class="w-300px"
    use:autosize
    spellcheck="false"
    rows="1"
    placeholder="User Message"
  ></textarea>
</div>

<style>
  .box {
    box-shadow: 0 0 100px rgba(255, 102, 0, 0.15);
  }
</style>
