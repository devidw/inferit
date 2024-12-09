<script lang="ts">
  import { Handle, Position, useSvelteFlow } from "@xyflow/svelte"
  import autosize from "svelte-autosize"
  import { edges, nodes, settings } from "./state.js"
  import DropBtn from "./drop_btn.svelte"
  import NextBtn from "./next_btn.svelte"
  import { writable } from "svelte/store"
  import {
    default_param_syncs,
    type Param_Key,
    type Params,
    browser_backend_name,
  } from "./types.js"
  import { infer_it } from "./infer_it.js"
  import { untrack } from "svelte"
  import SyncControl from "./sync_control.svelte"
  import { add_system_node, add_user_node } from "./nodes.js"
  import { editor_state } from "./editor.svelte.js"

  const { screenToFlowPosition } = useSvelteFlow()

  let {
    data,
  }: {
    data: { id: string }
  } = $props()

  const status = writable<"idle" | "busy">("idle")

  let show_params = $state(true)
  let textarea: HTMLTextAreaElement | null = $state(null)

  const index = $derived.by(() => {
    return $nodes.findIndex((node) => node.id === data.id)
  })

  let _param_syncs: Param_Key[] = $state([])
  const _params: Partial<Params> = $state({})

  const param_syncs_proxy = {
    get value() {
      return $nodes[index].data.param_syncs ?? [...default_param_syncs]
    },
    set value(value: Param_Key[]) {
      $nodes[index].data.param_syncs = value
      _param_syncs = value
    },
  }

  const params_proxy = {
    get backend() {
      return $nodes[index].data.params.backend
    },
    set backend(backend: string) {
      $nodes[index].data.params.backend = backend
      _params.backend = backend
    },

    get model() {
      return $nodes[index].data.params.model
    },
    set model(model: string) {
      $nodes[index].data.params.model = model
      _params.model = model
    },

    get prompt() {
      return $nodes[index].data.params.prompt
    },
    set prompt(prompt: string) {
      $nodes[index].data.params.prompt = prompt
      _params.prompt = prompt

      // if (
      //   editor_state.ongoing_session &&
      //   editor_state.node_id === data.id &&
      //   editor_state.content !== prompt
      // ) {
      //   editor_state.content = prompt
      // }
    },

    get max_tokens() {
      return $nodes[index].data.params.max_tokens
    },
    set max_tokens(max_tokens: number) {
      $nodes[index].data.params.max_tokens = max_tokens
      _params.max_tokens = max_tokens
    },

    get temperature() {
      return $nodes[index].data.params.temperature
    },
    set temperature(temperature: number) {
      $nodes[index].data.params.temperature = temperature
      _params.temperature = temperature
    },

    get top_p() {
      return $nodes[index].data.params.top_p
    },
    set top_p(top_p: number) {
      $nodes[index].data.params.top_p = top_p
      _params.top_p = top_p
    },

    get top_k() {
      return $nodes[index].data.params.top_k
    },
    set top_k(top_k: number) {
      $nodes[index].data.params.top_k = top_k
      _params.top_k = top_k
    },

    get stop() {
      return $nodes[index].data.params.stop
    },
    set stop(stop: string) {
      $nodes[index].data.params.stop = stop
      _params.stop = stop
    },

    get min_p() {
      return $nodes[index].data.params.min_p
    },
    set min_p(min_p: number) {
      $nodes[index].data.params.min_p = min_p
      _params.min_p = min_p
    },
  }

  $effect(() => {
    console.info("sync run")

    // deps

    _param_syncs

    _params.backend
    _params.prompt
    _params.model
    _params.max_tokens
    _params.temperature
    _params.top_p
    _params.top_k
    _params.stop
    _params.min_p

    untrack(sync_it)
  })

  function sync_it() {
    const patch_set: Partial<Params> = {}

    for (const sync_key of param_syncs_proxy.value) {
      patch_set[sync_key] = params_proxy[sync_key]
    }

    // console.info({
    //   keys_to_patch: Object.keys(patch_set),
    //   patch_set,
    // })

    if (Object.keys(patch_set).length === 0) {
      return
    }

    nodes.update((the_nodes) => {
      const sys_nodes = the_nodes.filter(
        (node) => node.type === "custom-system-node",
      )

      sys_nodes.forEach((sys_node) => {
        if (sys_node.id === data.id) {
          return
        }

        // console.info(`[${sys_node.id}] start sync patch`, sys_node.data)

        for (const [key, value] of Object.entries(patch_set)) {
          if (!sys_node.data.param_syncs?.includes(key)) {
            continue
          }

          // console.info(`[${sys_node.id}] '${key}' -> update`)

          sys_node.data.params[key] = value
        }
      })

      return the_nodes
    })
  }

  function drop_me() {
    const connected_ones = $edges.filter((edge) => edge.source === data.id)
    const ids_to_drop = [data.id, ...connected_ones.map((edge) => edge.target)]
    $nodes = $nodes.filter((node) => !ids_to_drop.includes(node.id))
  }

  function on_clone() {
    add_system_node({
      params: Object.assign({}, params_proxy),
      param_syncs: [...param_syncs_proxy.value],
    })
  }

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

  function open_in_editor() {
    editor_state.ongoing_session = true
    editor_state.node_id = data.id
    editor_state.content = params_proxy.prompt
  }

  $effect(() => {
    if (
      !editor_state.ongoing_session ||
      editor_state.node_id !== data.id ||
      params_proxy.prompt === editor_state.content
    ) {
      return
    }

    params_proxy.prompt = editor_state.content
  })
</script>

<div
  class="box w-500px relative bg-stone-8 rounded-lg border-.5 p2
font-mono text-stone-3 border-stone-5"
>
  {#if import.meta.env.DEV}
    <span class="text-xs bg-orange-9">
      {data.id}
    </span>
  {/if}

  <DropBtn {drop_me} disabled={$status === "busy"} />

  <NextBtn
    func={on_next_user}
    classes="left-[calc(50%_-_8px_-_20px)]!"
    icon="i-eva:arrow-ios-downward-outline"
  />

  <NextBtn
    func={on_next_bot}
    classes="left-[calc(50%_-_8px_+_20px)]!"
    allow_abort
    {status}
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
    onclick={on_clone}
    aria-label="fork"
    disabled={$status === "busy"}
    class="bg-stone-6 rounded-full absolute left-36px -top-8px z-1
    w-16px h-16px flex justify-center items-center text-xs"
  >
    <div class="i-eva:copy-outline"></div>
  </button>

  <fieldset class="space-y-2" disabled={$status === "busy"}>
    {#if show_params}
      <div class="text-xs space-y-2">
        <label class="flex items-center space-x-2">
          <SyncControl value="backend" bind:group={param_syncs_proxy.value} />
          <span class="w-50px">Backend</span>
          <select bind:value={params_proxy.backend} class="w-full">
            <option value={browser_backend_name}>{browser_backend_name}</option>
            {#each $settings.backends as backend}
              <option value={backend.base_url}>{backend.base_url}</option>
            {/each}
          </select>
        </label>

        <label class="flex items-center space-x-2">
          <SyncControl value="model" bind:group={param_syncs_proxy.value} />
          <span class="w-50px">Model</span>
          <input
            type="text"
            placeholder="Model"
            class="w-full"
            bind:value={params_proxy.model}
            spellcheck="false"
            disabled={params_proxy.backend === browser_backend_name}
          />
        </label>

        <div class="params grid grid-gap-2 grid-cols-2">
          <label class="flex items-center space-x-2">
            <SyncControl
              value="temperature"
              bind:group={param_syncs_proxy.value}
            />
            <input
              type="number"
              min="0"
              step="0.1"
              bind:value={params_proxy.temperature}
            />
            <div class="">temperature</div>
          </label>

          <label class="flex items-center space-x-2">
            <SyncControl value="min_p" bind:group={param_syncs_proxy.value} />
            <input
              type="number"
              min="0"
              step="0.1"
              bind:value={params_proxy.min_p}
              disabled={params_proxy.backend === browser_backend_name}
            />
            <div class="">min_p</div>
          </label>

          <label class="flex items-center space-x-2">
            <SyncControl value="top_p" bind:group={param_syncs_proxy.value} />
            <input
              type="number"
              bind:value={params_proxy.top_p}
              disabled={params_proxy.backend === browser_backend_name}
            />
            <div class="">top_p</div>
          </label>

          <label class="flex items-center space-x-2">
            <SyncControl value="top_k" bind:group={param_syncs_proxy.value} />
            <input type="number" bind:value={params_proxy.top_k} />
            <div class="">top_k</div>
          </label>

          <label class="flex items-center space-x-2">
            <SyncControl value="stop" bind:group={param_syncs_proxy.value} />
            <input
              type="text"
              bind:value={params_proxy.stop}
              disabled={params_proxy.backend === browser_backend_name}
            />
            <div class="">stop</div>
          </label>

          <label class="flex items-center space-x-2">
            <SyncControl
              value="max_tokens"
              bind:group={param_syncs_proxy.value}
            />
            <input
              type="number"
              min="1"
              bind:value={params_proxy.max_tokens}
              disabled={params_proxy.backend === browser_backend_name}
            />
            <div class="">max_tokens</div>
          </label>
        </div>
      </div>
    {/if}

    <div class="flex space-x-2">
      {#if show_params}
        <div class="mt1.5">
          <SyncControl value="prompt" bind:group={param_syncs_proxy.value} />
        </div>
        <div class="flex items-center">
          <div
            onclick={open_in_editor}
            class="i-eva:expand-outline {editor_state.node_id === data.id
              ? 'text-stone-5'
              : 'text-stone-3'}"
          ></div>
        </div>
      {/if}
      <textarea
        disabled={editor_state.ongoing_session}
        bind:value={params_proxy.prompt}
        placeholder="System Message"
        use:autosize
        class="w-full max-h-250px min-h-25px overflow-x-hidden!"
        bind:this={textarea}
        spellcheck="false"
        onfocusin={() => {
          if (!textarea) return
          autosize.update(textarea)
        }}
        onfocusout={(e) => {
          e.target.style.height = "25px"
        }}
        rows="1"
      ></textarea>
    </div>
  </fieldset>

  <!-- <Handle type="source" position={Position.Bottom} class="hidden" /> -->
  <Handle
    type="source"
    position={Position.Bottom}
    id="source-bottom"
    class="sr-only"
  />
  <!-- <Handle type="target" position={Position.Left} id="target-left" />
  <Handle type="source" position={Position.Right} id="source-right" /> -->
</div>

<style>
  .box {
    box-shadow: 0 0 100px rgba(255, 102, 0, 0.2);
  }

  select,
  input {
    --at-apply: "border-0.5 border-stone-5 rounded px2 py1";
  }

  .params input:not([type="checkbox"]) {
    --at-apply: "w-70px";
  }

  :disabled {
    --at-apply: "op50";
  }
</style>
