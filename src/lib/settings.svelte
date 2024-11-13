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
</script>

<svelte:window onkeydown={on_win_key} />

<div
  class="fixed left-20 top-10 bottom-10 z-1 bg-black rounded-4 font-mono
text-stone-3 border-0.5 border-stone-5 overflow-y-auto px4 pb2 max-w-2xl"
>
  <div
    class="sticky top-0 flex justify-between mb1 backdrop-blur pt2 pb1 text-xs"
  >
    <button type="button" class="op70" onclick={close_it}>Close [ESC]</button>
  </div>

  <div class="space-y-2">
    <div class="info">
      <p>
        This is saved on your device only. Inference-calls are made from your
        device only.
      </p>

      <p>You can use any OpenAI-compatible API.</p>
    </div>

    <label>
      <span> API Base URL </span>
      <input
        type="url"
        bind:value={$settings.base_url}
        placeholder="Base URL"
      />
    </label>

    <label>
      <span>API Key</span>
      <input
        type="password"
        bind:value={$settings.api_key}
        placeholder="API Key"
      />
    </label>

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

    <div class="py2"></div>

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
