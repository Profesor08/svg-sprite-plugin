import { defineConfig, type WatchFiles } from "@rsbuild/core";
import { RsbuildSvgSpritePlugin } from "./src/rsbuild-plugin";

const config: ReturnType<typeof defineConfig> = defineConfig(() => {
  return {
    plugins: [
      new RsbuildSvgSpritePlugin([
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
          import: "./index.ts",
        },
      },
    },

    html: {
      template: "./index.html",
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

export default config;
