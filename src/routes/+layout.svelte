<script lang="ts">
  import "@unocss/reset/tailwind.css"
  import "uno.css"
  import "./style.css"
</script>

<slot />

<style>
  :global(body) {
    background: black;
    color: white;
    hyphens: auto;
  }
</style>
