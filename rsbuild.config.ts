import { defineConfig, WatchFiles } from "@rsbuild/core";
import { rsbuildSvgSpritePlugin } from "./src/svg-sprite-rsbuild/RsbuildSvgSpritePlugin";

export default defineConfig(() => {
  return {
    plugins: [
      rsbuildSvgSpritePlugin([
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

    source: {
      entry: {
        index: {
          import: "./src/svg-sprite-rsbuild/index.js",
        },
      },
    },

    html: {
      template: "./src/svg-sprite-rsbuild/index.html",
    },

    dev: {
      watchFiles: {
        paths: [
          "./rsbuild.config.ts",
          "./tsconfig.json",
          "./eslint.config.mjs",
          "./.prettierrc",
          "./src/svg-sprite/*",
          "./src/svg-sprite-rsbuild/RsbuildSvgSpritePlugin.ts",
        ],
        type: "reload-server",
      } satisfies WatchFiles,
    },

    server: {
      open: false,
    },
  };
});
