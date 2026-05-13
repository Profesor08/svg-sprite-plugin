import { defineConfig } from "vite";
import { ViteSvgSpritePlugin } from "./src/vite-plugin";

export default defineConfig({
  plugins: [
    new ViteSvgSpritePlugin([
      {
        input: [
          {
            path: "../../icons/plain/",
            color: "currentColor",
          },
          {
            path: "../../icons/colored/",
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

  server: {
    port: 3000,
  },
});
