<script lang="ts">
  import { settings } from "./state.js"

  let {
    close_it,
  }: {
    close_it: () => void
  } = $props()

  function on_win_key(e: KeyboardEvent) {
    if (e.key === "Escape") {
      close_it()
    }
  }

  function add_backend() {
    $settings.backends = [
      ...$settings.backends,
      {
        base_url: "",
        api_key: "",
      },
    ]
  }

  function drop_backend(index: number) {
    $settings.backends = $settings.backends.filter(
      (_, _index) => _index !== index
    )
  }
</script>

<svelte:window onkeydown={on_win_key} />

<div
  class="fixed left-20 top-10 bottom-10 z-1 bg-black rounded-4 font-mono
text-stone-3 border-0.5 border-stone-5 overflow-y-auto px4 pb2 max-w-70vw lg:max-w-2xl"
>
  <div
    class="sticky top-0 flex justify-between mb1 backdrop-blur pt2 pb1 text-xs"
  >
    <button type="button" class="op70" onclick={close_it}>Close [ESC]</button>
  </div>

  <div class="">
    <div class="info">
      <p>
        This is saved on your device only. Inference-calls are made from your
        device only.
      </p>

      <p>You can use any OpenAI-compatible API.</p>
    </div>

    <div class="mt2 space-y-4">
      {#each $settings.backends as _, index}
        <div
          class="relative border-l border-t border-stone-7 border-dashed pl2 rounded-tl"
        >
          <button
            class="absolute right-0 top-1 text-red-7"
            type="button"
            onclick={() => drop_backend(index)}
          >
            <div class="i-eva:close-outline"></div>
          </button>

          <label>
            <span> API Base URL </span>
            <input
              type="url"
              bind:value={$settings.backends[index].base_url}
              placeholder="Base URL"
            />
          </label>

          <label>
            <span>API Key</span>
            <input
              type="password"
              bind:value={$settings.backends[index].api_key}
              placeholder="API Key"
            />
          </label>
        </div>
      {/each}
    </div>

    <div class="mt2 text-start">
      <button type="button" onclick={add_backend} class="">
        <div class="i-eva:plus-outline"></div>
      </button>
    </div>

    <div class="my4 border-b border-stone-7 border-dashed"></div>

    <div class="flex space-x-4">
      <label class="one-line">
        <input type="radio" value="chat" bind:group={$settings.endpoint} />
        <span>Chat Endpoint</span>
      </label>

      <label class="one-line">
        <input
          type="radio"
          value="completions"
          bind:group={$settings.endpoint}
        />
        <span>Completions Endpoint</span>
      </label>
    </div>

    {#if $settings.endpoint === "completions"}
      <label>
        <span> User Prefix </span>
        <input type="url" bind:value={$settings.user_prefix} />
      </label>

      <label>
        <span> Bot Prefix </span>
        <input type="url" bind:value={$settings.bot_prefix} />
      </label>
    {/if}

    <div class="my4 border-b border-stone-7 border-dashed"></div>

    <label class="one-line">
      <input
        type="checkbox"
        bind:checked={$settings.browser_ai_offline_fallback}
      />
      <span>Fall back to browser built-in llm when offline (Gemini Nano)</span>
    </label>

    <div class="info">
      <p>
        Chromium browsers only. You have to opt in to the preview and local
        models have to be properly downloaded by the browser.
        <a
          target="_blank"
          rel="noopener nofollow"
          href="https://docs.google.com/document/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c/edit?tab=t.0#heading=h.witohboigk0o"
          >Setup guide</a
        >
      </p>

      <p>
        You might want to disable this, if you want to use a local backend when
        you are offline.
      </p>
    </div>
  </div>
</div>

<style>
  .one-line {
    --at-apply: "flex! space-x-2";
  }

  .one-line input {
    --at-apply: "w-auto!";
  }

  .info {
    --at-apply: "text-xs text-stone-4 columns-2";
  }

  input {
    --at-apply: "w-full border-0.5 border-stone-5 rounded px3 py1";
  }

  p + p {
    --at-apply: "mt1";
  }

  a {
    --at-apply: "underline text-cyan-5";
  }

  label {
    --at-apply: "block";
  }

  label span {
    --at-apply: "text-xs text-stone-3";
  }
</style>
