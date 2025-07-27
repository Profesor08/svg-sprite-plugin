import { defineConfig, type WatchFiles } from "@rsbuild/core";
import { rsbuildSvgSpritePlugin } from "./src/rsbuild-plugin";

export default defineConfig(() => {
  return {
    plugins: [
      rsbuildSvgSpritePlugin([
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

    source: {
      entry: {
        index: {
          import: "../../src/index.ts",
        },
      },
    },

    html: {
      title: "rsbuild:svg-sprite-plugin",
      template: "../../src/index.html",
    },

    dev: {
      watchFiles: {
        paths: [
          "./rsbuild.config.ts",
          "./tsconfig.json",
          "./eslint.config.mjs",
          "./.prettierrc",
          "./src/*",
          "../../src/*",
          "../../icon/*",
        ],
        type: "reload-server",
      } satisfies WatchFiles,
    },

    server: {
      open: false,
    },
  };
});
