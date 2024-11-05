<script lang="ts">
  let { drop_me, disabled }: { drop_me: () => void; disabled?: boolean } =
    $props()
</script>

<div class="absolute -top-2 -left-2">
  <button
    type="button"
    onclick={drop_me}
    class="bg-red-9 text-red-1 p0.5 rounded-full"
    {disabled}
  >
    <div class="i-eva:close-outline"></div>
  </button>
</div>
