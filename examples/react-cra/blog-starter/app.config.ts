import contentCollections from "@content-collections/vinxi";
import { defineConfig } from "@tanstack/start/config";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
  tsr: {
    appDirectory: "src",
  },
  vite: {
    plugins: [
      contentCollections(),
      viteTsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tailwindcss(),
    ],
  },
});

export default config;
