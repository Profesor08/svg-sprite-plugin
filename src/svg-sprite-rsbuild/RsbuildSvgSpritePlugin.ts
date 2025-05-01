import {
  DevConfig,
  RsbuildPluginAPI,
  WatchFiles,
  type RsbuildPlugin,
} from "@rsbuild/core";
import chokidar, { type FSWatcher } from "chokidar";
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
  private readonly svgSpriteManager: SvgSpriteManager;
  private readonly watcher: FSWatcher;

  constructor(options: SvgSpriteOptions[]) {
    this.options = options;
    this.svgSpriteManager = new SvgSpriteManager(this.options);
    this.watcher = chokidar.watch(
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
  }

  setup(api: RsbuildPluginAPI) {
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
      this.watcher.on("add", (filePath: string) => {
        this.svgSpriteManager.action("add", filePath);
      });

      this.watcher.on("change", (filePath: string) => {
        this.svgSpriteManager.action("change", filePath);
      });

      this.watcher.on("unlink", (filePath: string) => {
        this.svgSpriteManager.action("unlink", filePath);
      });

      this.svgSpriteManager.emit();
    });

    api.onCloseDevServer(() => {
      this.watcher.close();
      this.svgSpriteManager.destroy();
    });
  }
}
