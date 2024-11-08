import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"
import unocss from "unocss/vite"
import transformerDirectives from "@unocss/transformer-directives"
import preset_default from "unocss/preset-uno"
import preset_icons from "unocss/preset-icons"
import wasm_thing from "vite-plugin-wasm"

export default defineConfig({
  plugins: [
    sveltekit(),
    unocss({
      presets: [preset_default(), preset_icons()],
      transformers: [transformerDirectives()],
    }),
    wasm_thing(),
  ],
})
