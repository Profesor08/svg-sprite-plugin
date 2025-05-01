import {
  DevConfig,
  RsbuildPluginAPI,
  WatchFiles,
  type RsbuildPlugin,
} from "@rsbuild/core";
import chokidar from "chokidar";
import { type SvgSpriteOptions } from "../svg-sprite/SvgSprite";
import { SvgSpriteManager } from "../svg-sprite/SvgSpriteManager";

export const rsbuildSvgSpritePlugin = (
  options: SvgSpriteOptions[],
): RsbuildPlugin => {
  return new RsbuildSvgSpritePlugin(options);
};

class RsbuildSvgSpritePlugin implements RsbuildPlugin {
  public readonly name = "rsbuild:svg-sprite-plugin";
  private readonly options: SvgSpriteOptions[];

  constructor(options: SvgSpriteOptions[]) {
    this.options = options;
  }

  setup(api: RsbuildPluginAPI) {
    if (api.context.action !== "dev") {
      return;
    }

    const svgSpriteManager = new SvgSpriteManager(this.options);
    const watcher = chokidar.watch(
      this.options
        .map((options) => options.input.map((input) => input.path))
        .flat(),
      {
        awaitWriteFinish: {
          stabilityThreshold: 500,
          pollInterval: 100,
        },
      },
    );

    api.modifyRsbuildConfig((config) => {
      const devWatchFiles: WatchFiles[] = [config.dev?.watchFiles ?? []].flat();
      const watchFiles: WatchFiles[] = this.options.map((option) => ({
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
        svgSpriteManager.action("add", filePath);
      });

      watcher.on("change", (filePath: string) => {
        svgSpriteManager.action("change", filePath);
      });

      watcher.on("unlink", (filePath: string) => {
        svgSpriteManager.action("unlink", filePath);
      });

      svgSpriteManager.emit();
    });

    api.onCloseDevServer(() => {
      watcher.close();
      svgSpriteManager.destroy();
    });
  }
}
