import type { Plugin } from "vite";
import { SvgSprite, SvgSpriteOptions } from "./SvgSprite";

export class ViteSvgSpritePlugin implements Plugin {
  public name = "vite-svg-sprite-plugin";
  public apply: Plugin["apply"] = "serve";

  private sprites: SvgSprite[];

  constructor(options: SvgSpriteOptions[]) {
    this.sprites = options.map((options) => new SvgSprite(options));
  }

  buildStart = () => {
    this.sprites.forEach((sprite) => sprite.start());
  };

  closeBundle = () => {
    this.sprites.forEach((sprite) => sprite.stop());
  };
}
