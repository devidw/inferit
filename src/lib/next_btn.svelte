<script lang="ts">
  let {
    func,
    disabled,
    classes,
    icon,
  }: {
    func: (e: MouseEvent) => void
    disabled?: boolean
    classes?: string
    icon?: string
  } = $props()
</script>

<button
  type="button"
  aria-label="next"
  {disabled}
  onclick={func}
  class="bg-cyan-7 rounded-full absolute -bottom-8px z-1 left-[calc(50%_-_8px)]
w-16px h-16px flex justify-center items-center text-xs {classes ?? ''}"
>
  <div class={icon ?? "i-eva:arrowhead-down-fill"}></div>
</button>
