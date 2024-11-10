<script lang="ts">
  import "@unocss/reset/tailwind.css"
  import "uno.css"
  import "./style.css"
  import "github-markdown-css/github-markdown-dark.css"
  import "@fontsource-variable/alegreya"
  import "@fontsource-variable/alegreya/wght-italic.css"
  import { Toaster } from "svelte-french-toast"
  import Main from "./lib/main.svelte"
</script>

<Toaster position="bottom-center" />

<Main />

<style>
</style>
