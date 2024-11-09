<script lang="ts">
  import { Handle, Position } from "@xyflow/svelte"
  import { nodes } from "./state.js"
  import DropBtn from "./drop_btn.svelte"
  import NextBtn from "./next_btn.svelte"
  import { infer_it } from "./infer_it.js"
  import { writable } from "svelte/store"
  import autosize from "svelte-autosize"
  import { get_token_count } from "./tokens.js"
  import { onMount } from "svelte"

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

  let textarea_el: HTMLTextAreaElement | null = null
  let content = $state("")
  let token_count = $derived(get_token_count(content))

  $effect(() => {
    if (content.length === 0) {
      return
    }

    nodes.update((the_nodes) => {
      const me = the_nodes.find((node) => node.id === data.id)

      if (!me) {
        return the_nodes
      }

      // save
      me.data.content = content

      return the_nodes
    })

    // console.info({ content })
  })

  function drop_me() {
    $nodes = $nodes.filter((node) => node.id !== data.id)
  }

  async function on_next() {
    await infer_it({
      thread_id: data.thread_id,
      src_id: data.id,
      status,
    })
  }

  function on_key(e: KeyboardEvent) {
    if (e.code !== "Enter" || e.shiftKey) {
      return
    }

    e.preventDefault()

    on_next()
  }

  onMount(() => {
    const me = $nodes.find((node) => node.id === data.id)

    if (!me) {
      return
    }

    // restore
    if (me.data.content && content.length === 0) {
      content = me.data.content as string
    }
  })
</script>

<div
  class="box relative bg-stone-8 border-0.5 font-mono p2
  rounded-lg text-stone-3 border-stone-5"
>
  <!-- <div>user {data.id}</div> -->

  <Handle type="target" position={Position.Top} />
  <Handle type="source" position={Position.Bottom} />

  <DropBtn {drop_me} />

  <NextBtn func={on_next} />

  <div class="absolute right-2 bottom-2 op50 text-xs">
    {token_count}
  </div>

  <textarea
    bind:value={content}
    class="w-300px pr4"
    use:autosize
    spellcheck="false"
    rows="1"
    placeholder="User Message"
    bind:this={textarea_el}
    onkeydown={on_key}
  ></textarea>
</div>

<style>
  .box {
    box-shadow: 0 0 100px rgba(255, 102, 0, 0.15);
  }
</style>
