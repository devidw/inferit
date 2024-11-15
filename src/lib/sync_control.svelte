<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements"

  interface $$Props extends HTMLInputAttributes {
    value: unknown
    group: unknown[]
  }

  export let value: unknown
  export let group: unknown[]

  function on_click() {
    if (group.includes(value)) {
      group = group.filter((a_value) => a_value !== value)
    } else {
      group = [...group, value]
    }
  }
</script>

<div
  class="i-eva:link-2-outline cursor-pointer text-xs {group.includes(value)
    ? 'text-cyan-5'
    : 'bg-stone-5'}"
  onclick={on_click}
></div>
