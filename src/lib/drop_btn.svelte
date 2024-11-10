<script lang="ts">
  let { drop_me, disabled }: { drop_me: () => void; disabled?: boolean } =
    $props()
</script>

<button
  type="button"
  onclick={drop_me}
  class="bg-red-9 text-red-1 p0.5 rounded-full text-xs absolute -left-8px -top-8px"
  {disabled}
>
  <div class="i-eva:close-outline"></div>
</button>
