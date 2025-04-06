import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";
import { ViteSvgSpritePlugin } from "./src/svg-sprite-vite/ViteSvgSpritePlugin";

export default defineConfig({
  server: {
    port: 3000,
  },

  plugins: [
    new ViteSvgSpritePlugin([
      {
        input: [
          {
            path: "./icons/plain/",
            color: "currentColor",
          },
          {
            path: "./icons/colored/",
          },
        ],
        output: "public/static/icons.svg",
      },
    ]),
    dts({
      tsconfigPath: "./tsconfig.json",
    }),
  ],

  build: {
    lib: {
      entry: "src/ViteSvgSpritePlugin.ts",
      name: "index",
      fileName: "index",
      formats: ["es"],
    },

    rollupOptions: {
      external: Object.keys(pkg.dependencies)
        .map((name) => [name, new RegExp(`${name}/(.*)`)])
        .flat(),
    },
  },
});
