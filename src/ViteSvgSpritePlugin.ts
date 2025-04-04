import convertPath from "@stdlib/utils-convert-path";
import path from "path";
import type { Plugin } from "vite";
import { SvgSprite, SvgSpriteOptions } from "./SvgSprite";

export class ViteSvgSpritePlugin implements Plugin {
  public name = "vite-svg-sprite-plugin";
  public apply: NonNullable<Plugin["apply"]> = "serve";

  private sprites: SvgSprite[];
  private plaginOptions: SvgSpriteOptions[];

  constructor(options: SvgSpriteOptions[]) {
    this.plaginOptions = options;
    this.sprites = this.plaginOptions.map((options) => new SvgSprite(options));
  }

  buildStart = () => {
    this.sprites.forEach((sprite) => sprite.start());
  };

  closeBundle = () => {
    this.sprites.forEach((sprite) => sprite.stop());
  };

  handleHotUpdate: NonNullable<Plugin["handleHotUpdate"]> = ({
    file,
    server,
  }) => {
    this.plaginOptions.forEach(({ output }) => {
      const filePath = convertPath(path.relative(process.cwd(), file), "posix");

      if (filePath === output) {
        server.ws.send({
          type: "full-reload",
        });
      }
    });
  };
}
