import { SvgSprite, SvgSpriteOptions } from "@prof-dev/svg-sprite";
import chokidar, { type FSWatcher } from "chokidar";
import { Compiler, type WebpackPluginInstance } from "webpack";

export class WebpackSvgSpritePlugin implements WebpackPluginInstance {
  private readonly name = "WebpackSvgSpritePlugin";
  private readonly options: SvgSpriteOptions[];
  private readonly svgSpriteManager: SvgSprite;
  private readonly watcher: FSWatcher;

  constructor(options: SvgSpriteOptions[]) {
    this.options = options;
    this.svgSpriteManager = new SvgSprite(this.options);
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

      this.svgSpriteManager.emit();
    });

    compiler.hooks.shutdown.tap(this.name, () => {
      this.watcher.close();
      this.svgSpriteManager.destroy();
    });
  };
}
