<script lang="ts">
  import { Handle, Position, useSvelteFlow } from "@xyflow/svelte"
  import autosize from "svelte-autosize"
  import {
    edges,
    nodes,
    model_names,
    add_system_node,
    add_user_node,
  } from "./state.js"
  import DropBtn from "./drop_btn.svelte"
  import NextBtn from "./next_btn.svelte"
  import { writable } from "svelte/store"
  import { default_params, type Params } from "./types.js"
  import { infer_it } from "./infer_it.js"

  let {
    data,
  }: {
    data: {
      id: string
      params: Params
    }
  } = $props()

  const status = writable<"idle" | "busy">("idle")

  let show_params = $state(true)
  let textarea: HTMLTextAreaElement | null = $state(null)
  let params: Params = $state(
    Object.assign({}, data.params) ?? Object.assign({}, default_params)
  )

  function drop_me() {
    const connected_ones = $edges.filter((edge) => edge.source === data.id)
    const ids_to_drop = [data.id, ...connected_ones.map((edge) => edge.target)]
    $nodes = $nodes.filter((node) => !ids_to_drop.includes(node.id))
  }

  function fork_me() {
    add_system_node({
      params: Object.assign({}, params),
    })
  }

  // save params
  // todo: i think we only need that once on mount since we store the reference, right?
  $effect(() => {
    const me = $nodes.find((node) => node.id === data.id)

    if (!me) {
      return
    }

    me.data.params = params
  })

  const { screenToFlowPosition } = useSvelteFlow()

  async function on_next_user(e: MouseEvent) {
    add_user_node({
      thread_id: data.id,
      src_id: data.id,
      id: data.id,
      e,
      cords_helper: screenToFlowPosition,
    })
  }

  async function on_next_bot(e: MouseEvent) {
    await infer_it({
      thread_id: data.id,
      src_id: data.id,
      status,
    })
  }
</script>

<div
  class="box w-500px relative bg-stone-8 rounded-lg border-.5 p2
font-mono text-stone-3 border-stone-5"
>
  <DropBtn {drop_me} disabled={$status === "busy"} />

  <NextBtn
    func={on_next_user}
    disabled={$status === "busy"}
    classes="left-[calc(50%_-_8px_-_20px)]!"
    icon="i-eva:arrow-ios-downward-outline"
  />

  <NextBtn
    func={on_next_bot}
    disabled={$status === "busy"}
    classes="left-[calc(50%_-_8px_+_20px)]!"
  />

  <button
    type="button"
    onclick={() => {
      show_params = !show_params
    }}
    aria-label="params"
    disabled={$status === "busy"}
    class="bg-stone-6 rounded-full absolute left-14px -top-8px z-1
    w-16px h-16px flex justify-center items-center text-xs"
  >
    {#if show_params}
      <div class="i-eva:options-2-fill"></div>
    {:else}
      <div class="i-eva:options-2-outline"></div>
    {/if}
  </button>

  <button
    type="button"
    onclick={fork_me}
    aria-label="fork"
    disabled={$status === "busy"}
    class="bg-stone-6 rounded-full absolute left-36px -top-8px z-1
    w-16px h-16px flex justify-center items-center text-xs"
  >
    <div class="i-eva:copy-outline"></div>
  </button>

  <datalist id="model_list">
    {#each model_names as one_model_name}
      <option value={one_model_name}>{one_model_name}</option>
    {/each}
  </datalist>

  <fieldset class="space-y-2" disabled={$status === "busy"}>
    {#if show_params}
      <div class="text-xs space-y-2">
        <label class="flex items-center space-x-2">
          <span class="w-50px">Model</span>
          <input
            type="text"
            placeholder="Model"
            class="w-full"
            bind:value={params.model}
            list="model_list"
            spellcheck="false"
          />
        </label>

        <div class="params grid grid-gap-2 grid-cols-2">
          <label class="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              step="0.1"
              bind:value={params.temperature}
            />
            <div class="">temperature</div>
          </label>

          <label class="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              step="0.1"
              bind:value={params.min_p}
              disabled={params.model === "Gemini Nano"}
            />
            <div class="">min_p</div>
          </label>

          <label class="flex items-center space-x-2">
            <input
              type="number"
              bind:value={params.top_p}
              disabled={params.model === "Gemini Nano"}
            />
            <div class="">top_p</div>
          </label>

          <label class="flex items-center space-x-2">
            <input type="number" bind:value={params.top_k} />
            <div class="">top_k</div>
          </label>

          <label class="flex items-center space-x-2">
            <input
              type="text"
              bind:value={params.stop}
              disabled={params.model === "Gemini Nano"}
            />
            <div class="">stop</div>
          </label>

          <label class="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              bind:value={params.max_tokens}
              disabled={params.model === "Gemini Nano"}
            />
            <div class="">max_tokens</div>
          </label>
        </div>
      </div>
    {/if}

    <textarea
      bind:value={params.prompt}
      placeholder="System Message"
      use:autosize
      class="w-full max-h-250px min-h-25px overflow-x-hidden!"
      bind:this={textarea}
      spellcheck="false"
      onfocusin={() => {
        if (!textarea) return
        autosize.update(textarea)
      }}
      rows="1"
    ></textarea>
  </fieldset>

  <!-- <Handle type="source" position={Position.Bottom} class="hidden" /> -->
  <Handle type="source" position={Position.Bottom} class="sr-only" />
</div>

<style>
  .box {
    box-shadow: 0 0 100px rgba(255, 102, 0, 0.2);
  }

  input {
    --at-apply: "border-0.5 border-stone-5 rounded px2 py1";
  }

  .params input {
    --at-apply: "w-70px";
  }

  .params input:disabled {
    --at-apply: "op50";
  }
</style>
