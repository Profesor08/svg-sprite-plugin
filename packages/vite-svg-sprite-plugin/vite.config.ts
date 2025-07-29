import { defineConfig } from "vite";
import { ViteSvgSpritePlugin } from "@prof-dev/vite-svg-sprite-plugin";

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
        declaration: {
          path: "src/icons.d.ts",
          namespace: "Icons",
          export: false,
        },
      },
    ]),
  ],
});
