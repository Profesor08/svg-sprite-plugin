import { SvgSprite, type SvgSpriteOptions } from "@prof-dev/svg-sprite";
import type { DevConfig, RsbuildPlugin, WatchFiles } from "@rsbuild/core";
import chokidar from "chokidar";

export const rsbuildSvgSpritePlugin = (
  options: SvgSpriteOptions[],
): RsbuildPlugin => {
  return {
    name: "prof-dev:svg-sprite-plugin",

    setup: (api) => {
      if (api.context.action !== "dev") {
        return;
      }

      const svgSprite = new SvgSprite(options);

      const watcher = chokidar.watch(
        options.flatMap((options) => options.input.map((input) => input.path)),
        {
          awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100,
          },
        },
      );

      api.modifyRsbuildConfig((config) => {
        const devWatchFiles: WatchFiles[] = [
          config.dev?.watchFiles ?? [],
        ].flat();
        const watchFiles: WatchFiles[] = options.map((option) => ({
          paths: option.output,
          type: "reload-page",
        }));

        const dev: DevConfig = {
          ...config.dev,
          watchFiles: [...devWatchFiles, ...watchFiles],
        };

        return {
          ...config,
          dev,
        };
      });

      api.onAfterStartDevServer(() => {
        watcher.on("add", (filePath: string) => {
          svgSprite.action("add", filePath);
        });

        watcher.on("change", (filePath: string) => {
          svgSprite.action("change", filePath);
        });

        watcher.on("unlink", (filePath: string) => {
          svgSprite.action("unlink", filePath);
        });

        svgSprite.emit();
      });

      api.onCloseDevServer(() => {
        watcher.close();
        svgSprite.destroy();
      });
    },
  };
};
