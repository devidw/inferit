<script lang="ts">
  import { editor_state } from "./editor.svelte.js"

  function close_editor() {
    editor_state.ongoing_session = false
    editor_state.node_id = null
    editor_state.content = ""
  }

  function on_key(e: KeyboardEvent) {
    if (e.key === "Escape") {
      close_editor()
    }
  }
</script>

<svelte:window onkeydown={on_key} />

{#if editor_state.ongoing_session}
  <div
    class="fixed w-xl h-screen right-0 top-0 bg-stone-8 z-1 border-l-1
  border-stone-5 p4 pb12"
  >
    <div class="flex justify-between mb2 font-mono">
      {#if import.meta.env.DEV}
        <div class="text-xs whitespace-pre">
          {JSON.stringify(editor_state, null, 4)}
        </div>
        <div
          onclick={close_editor}
          class="cursor-pointer i-eva:close-outline text-stone-3 text-lg"
        ></div>
      {/if}
    </div>

    <textarea
      class="w-full h-full font-mono! text-xs leading-150% text-stone-2"
      bind:value={editor_state.content}
    ></textarea>
  </div>
{/if}
