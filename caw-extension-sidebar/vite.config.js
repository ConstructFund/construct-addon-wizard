import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { viteSingleFile } from "vite-plugin-singlefile";
import Components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    Components({
      resolvers: [PrimeVueResolver()],
    }),
    vue(),
    vueDevTools(),
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "../html/QuickActions",
    emptyOutDir: true,
  },
});
