<script lang="ts">
  import {
    SvelteFlow,
    Controls,
    Background,
    BackgroundVariant,
  } from "@xyflow/svelte"
  import "@xyflow/svelte/dist/style.css"
  import { ControlButton, type NodeTypes } from "@xyflow/svelte"
  import SystemNode from "./system_node.svelte"
  import { nodes, edges } from "./state.js"
  import BotNode from "./bot_node.svelte"
  import UserNode from "./user_node.svelte"
  import Settings from "./settings.svelte"
  import Online from "./online.svelte"
  import { add_system_node } from "./nodes.js"
  import Editor from "./editor.svelte"

  const node_types: NodeTypes = {
    "custom-system-node": SystemNode,
    "custom-bot-node": BotNode,
    "custom-user-node": UserNode,
  }

  let show_settings = false

  function toggle_settings() {
    show_settings = !show_settings
  }
</script>

<div class="h-screen w-full absolute top-0">
  {#if show_settings}
    <Settings close_it={toggle_settings} />
  {/if}

  <Editor />

  <SvelteFlow
    colorMode={"dark"}
    {nodes}
    {edges}
    nodeTypes={node_types}
    fitView
    proOptions={{ hideAttribution: true }}
    zoomOnDoubleClick={false}
  >
    <Controls
      showZoom={false}
      showLock={false}
      showFitView={true}
      position={"top-left"}
    >
      <ControlButton onclick={() => add_system_node()}>
        <div class="i-eva:plus-outline"></div>
      </ControlButton>
      <ControlButton onclick={toggle_settings}>
        <div class="i-eva:settings-2-outline"></div>
      </ControlButton>
    </Controls>

    <Background variant={BackgroundVariant.Dots} />
  </SvelteFlow>
</div>

<Online />
