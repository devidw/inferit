<script lang="ts">
  import { Handle, Position } from "@xyflow/svelte"
  import autosize from "svelte-autosize"
  import { edges, nodes, model_names, add_node, settings } from "./state.js"
  import DropBtn from "./drop_btn.svelte"
  import { OpenAI } from "openai"

  const api_client = $derived(
    new OpenAI({
      baseURL: $settings.base_url,
      apiKey: $settings.api_key,
      dangerouslyAllowBrowser: true,
    })
  )

  let {
    data,
  }: {
    data: {
      id: string
      on_output: (a: {
        id: string
        output: string
        type: "error" | "success"
      }) => Promise<string>
      on_output_chunk: (a: { id: string; text: string }) => void
      params: Params
    }
  } = $props()

  type Params = {
    prompt: string
    model: string
    max_tokens: number
    temperature: number
    top_p: number
    top_k: number
    stop: string
    min_p: number
  }

  let status: "idle" | "busy" = $state("idle")
  let params: Params = $state(
    data.params ?? {
      model: "vicgalle/Roleplay-Llama-3-8B",
      prompt: "user: hii sweetie\nbot:",
      max_tokens: 100,
      temperature: 1,
      top_p: 1,
      top_k: 40,
      stop: "\\n",
      min_p: 0,
    }
  )
  let textarea: HTMLTextAreaElement | null = $state(null)

  async function on_submit(submit_event: SubmitEvent) {
    try {
      submit_event.preventDefault()

      status = "busy"

      const stream = await api_client.completions.create({
        ...params,
        stop: [params.stop === "\\n" ? "\n" : ""],
        stream: true,
      })

      const out_id = await data.on_output({
        id: data.id,
        output: "",
        type: "success",
      })

      for await (const chunk of stream) {
        data.on_output_chunk({ id: out_id, text: chunk.choices[0].text })
      }
    } catch (e) {
      await data.on_output({ id: data.id, output: e.message, type: "error" })
      console.error(e)
    } finally {
      status = "idle"
    }
  }

  function drop_me() {
    const connected_ones = $edges.filter((edge) => edge.source === data.id)
    const ids_to_drop = [data.id, ...connected_ones.map((edge) => edge.target)]
    $nodes = $nodes.filter((node) => !ids_to_drop.includes(node.id))
  }

  function fork_me() {
    add_node({ params: Object.assign({}, params) })
  }
</script>

<form
  class="box w-500px relative bg-stone-8 rounded-lg border-0.5 p2 text-xs font-mono text-stone-3
{status === 'busy' ? 'border-cyan animate-pulse' : 'border-stone-5'}"
  onsubmit={on_submit}
>
  <DropBtn {drop_me} disabled={status === "busy"} />

  <button
    type="submit"
    aria-label="generate"
    disabled={status === "busy"}
    class="bg-cyan-7 rounded-full absolute -bottom-8px z-1 left-[calc(50%_-_8px)]
    w-16px h-16px flex justify-center items-center"
  >
    <div class="i-eva:arrowhead-down-fill"></div>
  </button>

  <button
    type="button"
    onclick={fork_me}
    aria-label="fork"
    disabled={status === "busy"}
    class="bg-stone-5 rounded-full absolute -bottom-8px -right-8px z-1
    w-16px h-16px flex justify-center items-center"
  >
    <div class="i-eva:copy-outline"></div>
  </button>

  <datalist id="model_list">
    {#each model_names as one_model_name}
      <option value={one_model_name}>{one_model_name}</option>
    {/each}
  </datalist>

  <datalist id="card_list">
    <option value="e62wjcfr0yoamky">Karen</option>
  </datalist>

  <fieldset class="space-y-2" disabled={status === "busy"}>
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

    <textarea
      bind:value={params.prompt}
      placeholder="Prompt"
      use:autosize
      class="w-full max-h-250px min-h-25px overflow-x-hidden!"
      bind:this={textarea}
      spellcheck="false"
      onfocusin={() => {
        if (!textarea) return
        autosize.update(textarea)
      }}
      onfocusout={(event) => {
        event.target.style.height = "25px"
      }}
    ></textarea>

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
        <input type="number" min="0" step="0.1" bind:value={params.min_p} />
        <div class="">min_p</div>
      </label>

      <label class="flex items-center space-x-2">
        <input type="number" bind:value={params.top_p} />
        <div class="">top_p</div>
      </label>

      <label class="flex items-center space-x-2">
        <input type="number" bind:value={params.top_k} />
        <div class="">top_k</div>
      </label>

      <label class="flex items-center space-x-2">
        <input type="text" bind:value={params.stop} />
        <div class="">stop</div>
      </label>

      <label class="flex items-center space-x-2">
        <input type="number" min="1" bind:value={params.max_tokens} />
        <div class="">max_tokens</div>
      </label>
    </div>
  </fieldset>

  <Handle type="source" position={Position.Bottom} />
</form>

<style>
  .box {
    box-shadow: 0 0 100px rgba(255, 102, 0, 0.2);
  }

  textarea,
  input {
    --at-apply: "border-0.5 border-stone-5 rounded px2 py1";
  }

  .params input {
    --at-apply: "w-70px";
  }
</style>
