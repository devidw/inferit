<script lang="ts">
  import type { Writable } from "svelte/store"
  import { abort_controller } from "./state.js"

  let {
    func,
    classes,
    icon,
    allow_abort,
    status,
  }: {
    func: (e: MouseEvent) => void
    classes?: string
    icon?: string
    allow_abort?: boolean
    status?: Writable<"idle" | "busy">
  } = $props()

  function on_click(e: MouseEvent) {
    if ($status === "busy") {
      if (allow_abort) {
        $abort_controller.abort()
        $abort_controller = new AbortController()
      }
    } else {
      func(e)
    }
  }
</script>

<button
  type="button"
  aria-label="next"
  onclick={on_click}
  class="rounded-full absolute -bottom-8px z-1 left-[calc(50%_-_8px)]
w-16px h-16px flex justify-center items-center text-xs {classes ??
    ''} {$status === 'busy' ? 'bg-red-7' : 'bg-cyan-7'}"
>
  {#if $status === "busy"}
    <div class="i-eva:stop-circle-fill"></div>
  {:else}
    <div class={icon ?? "i-eva:arrowhead-down-fill"}></div>
  {/if}
</button>
