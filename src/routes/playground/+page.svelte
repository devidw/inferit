<script lang="ts">
  import {
    SvelteFlow,
    Controls,
    Background,
    BackgroundVariant,
  } from "@xyflow/svelte"
  import "@xyflow/svelte/dist/style.css"
  import { ControlButton, type NodeTypes, useSvelteFlow } from "@xyflow/svelte"
  import Infer from "./system_node.svelte"
  import { nodes, edges, add_node } from "./state.js"
  import BotNode from "./bot_node.svelte"
  import UserNode from "./user_node.svelte"
  import Settings from "./settings.svelte"

  const node_types: NodeTypes = {
    "custom-system-node": Infer,
    "custom-bot-node": BotNode,
    "custom-user-node": UserNode,
  }

  let show_settings = false

  function toggle_settings() {
    show_settings = !show_settings
  }
</script>

<svelte:head>
  <title>Playground</title>
</svelte:head>

<div class="h-screen w-full absolute top-0">
  {#if show_settings}
    <Settings close_it={toggle_settings} />
  {/if}

  <SvelteFlow
    colorMode={"dark"}
    {nodes}
    {edges}
    nodeTypes={node_types}
    fitView
    proOptions={{ hideAttribution: true }}
  >
    <Controls showZoom={false} showLock={false} showFitView={true}>
      <ControlButton onclick={() => add_node()}>
        <div class="i-eva:plus-outline"></div>
      </ControlButton>
      <ControlButton onclick={toggle_settings}>
        <div class="i-eva:settings-2-outline"></div>
      </ControlButton>
    </Controls>

    <Background variant={BackgroundVariant.Dots} />
  </SvelteFlow>
</div>
