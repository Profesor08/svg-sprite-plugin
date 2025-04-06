import chokidar, { type FSWatcher } from "chokidar";
import { Compiler, type WebpackPluginInstance } from "webpack";
import { type SvgSpriteOptions } from "../svg-sprite/SvgSprite";
import { SvgSpriteManager } from "../svg-sprite/SvgSpriteManager";

export class WebpackSvgSpritePlugin implements WebpackPluginInstance {
  private readonly name = "WebpackSvgSpritePlugin";
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

  apply = (compiler: Compiler) => {
    compiler.hooks.afterEnvironment.tap(this.name, () => {
      this.watcher.on("add", (filePath: string) => {
        this.svgSpriteManager.action("add", filePath);
      });

      this.watcher.on("change", (filePath: string) => {
        this.svgSpriteManager.action("change", filePath);
      });

      this.watcher.on("unlink", (filePath: string) => {
        this.svgSpriteManager.action("unlink", filePath);
      });
    });

    compiler.hooks.shutdown.tap(this.name, () => {
      this.watcher.close();
      this.svgSpriteManager.destroy();
    });
  };
}
