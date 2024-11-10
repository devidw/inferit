<script lang="ts">
  import { is_online } from "./state.js"
</script>

{#if $is_online === false}
  <div
    class="fixed left-2 top-2 text-amber text-xs font-mono uppercase tracking-widest"
  >
    offline
  </div>
{/if}
