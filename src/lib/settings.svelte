<script lang="ts">
  import DropBtn from "./drop_btn.svelte"
  import { settings } from "./state.js"
  import autosize from "svelte-autosize"

  let {
    close_it,
  }: {
    close_it: () => void
  } = $props()

  function on_submit(submit_mevent: SubmitEvent) {
    submit_mevent.preventDefault()
    localStorage.setItem("settings", JSON.stringify($settings))
    close_it()
  }
</script>

<form
  onsubmit={on_submit}
  class="fixed bottom-35 left-50 z-1 bg-black rounded-4 w-120 font-mono
text-stone-3 border-0.5 border-stone-5"
>
  <div class="relative p-4">
    <DropBtn drop_me={close_it} />

    <div class="space-y-2">
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

      <div class="text-end">
        <button type="submit" class="underline">Save</button>
      </div>

      <div class="text-xs text-stone-4">
        <p>
          This is saved on your device only. Inference-calls are made from your
          device only.
        </p>

        <p>You can use any OpenAI-compatible API.</p>

        <p>Example Backends:</p>

        <ul>
          <li>
            <a
              href="https://openrouter.ai"
              target="_blank"
              rel="noopener nofollow"
            >
              openrouter.ai
            </a>
          </li>
          <li>
            <a
              href="https://featherless.ai/register?referrer=C-Sikokn"
              target="_blank"
              rel="noopener nofollow"
            >
              featherless.ai
            </a>
          </li>
          <li>
            <a
              href="https://infermatic.ai"
              target="_blank"
              rel="noopener nofollow"
            >
              infermatic.ai
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</form>

<style>
  input {
    --at-apply: "w-full border-0.5 border-stone-5 rounded px3 py1";
  }

  p + p,
  p + ul {
    --at-apply: "mt1";
  }

  li + li {
    --at-apply: "mt0.5";
  }

  li {
    list-style-type: "- ";
    --at-apply: "ml4";
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
