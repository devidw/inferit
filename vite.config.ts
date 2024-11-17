import { svelte } from "@sveltejs/vite-plugin-svelte"
import { defineConfig } from "vite"
import unocss from "unocss/vite"
import transformerDirectives from "@unocss/transformer-directives"
import preset_default from "unocss/preset-uno"
import preset_icons from "unocss/preset-icons"
import wasm_thing from "vite-plugin-wasm"
import top_level_await from "vite-plugin-top-level-await"

export default defineConfig({
  base: "",
  plugins: [
    svelte(),
    unocss({
      presets: [preset_default(), preset_icons()],
      transformers: [transformerDirectives()],
    }),
    wasm_thing(),
    top_level_await(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        bg: "./src/bg.ts",
      },
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
})
