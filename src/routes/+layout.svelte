<script lang="ts">
  import "@unocss/reset/tailwind.css"
  import "uno.css"
  import "./style.css"
  import { Toaster } from "svelte-french-toast"
</script>

<Toaster position="bottom-center" />

<slot />

<style>
  :global(body) {
    background: black;
    color: white;
    hyphens: auto;
  }
</style>
