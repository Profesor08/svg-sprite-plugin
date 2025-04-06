import type { Plugin } from "vite";
import { SvgSpriteOptions } from "../svg-sprite/SvgSprite";
import { SvgSpriteManager } from "../svg-sprite/SvgSpriteManager";

export class ViteSvgSpritePlugin implements Plugin {
  public name = "vite-svg-sprite-plugin";
  public apply: NonNullable<Plugin["apply"]> = "serve";

  private svgSpriteManager: SvgSpriteManager;
  private plaginOptions: SvgSpriteOptions[];

  constructor(options: SvgSpriteOptions[]) {
    this.plaginOptions = options;
    this.svgSpriteManager = new SvgSpriteManager(this.plaginOptions);
  }

  configureServer: NonNullable<Plugin["configureServer"]> = (server) => {
    server.watcher.on("add", (filePath) => {
      this.svgSpriteManager.action("add", filePath);
    });

    server.watcher.on("change", (filePath) => {
      this.svgSpriteManager.action("change", filePath);
    });

    server.watcher.on("unlink", (filePath) => {
      this.svgSpriteManager.action("unlink", filePath);
    });
  };

  buildStart = () => {
    this.svgSpriteManager.emit();
  };

  closeBundle = () => {
    this.svgSpriteManager.destroy();
  };

  handleHotUpdate: NonNullable<Plugin["handleHotUpdate"]> = ({
    file,
    server,
  }) => {
    if (this.svgSpriteManager.isOutputFileMatch(file) === true) {
      server.ws.send({
        type: "full-reload",
      });
    }
  };
}
