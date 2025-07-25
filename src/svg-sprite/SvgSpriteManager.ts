import { getRelativePosixFilePath } from "../utils/path";
import { SvgSprite, SvgSpriteOptions } from "./SvgSprite";

export class SvgSpriteManager {
  private readonly sprites: SvgSprite[];
  private readonly options: SvgSpriteOptions[];
  private readonly batch: Set<SvgSprite>;
  private batchTimeoutId: NodeJS.Timeout | undefined;

  constructor(options: SvgSpriteOptions[]) {
    this.options = options.map(({ input, output, declaration }) => {
      return {
        input: input.map(({ path, color }) => ({
          path: getRelativePosixFilePath(path),
          color,
        })),
        output: getRelativePosixFilePath(output),
        declaration:
          declaration === undefined
            ? undefined
            : {
                path: getRelativePosixFilePath(declaration.path),
                export: declaration.export,
                namespace: declaration.namespace,
              },
      };
    });

    this.sprites = this.options.map((options) => new SvgSprite(options));

    this.batch = new Set();

    this.batchTimeoutId = undefined;
  }

  public emit = () => {
    for (const sprite of this.sprites) {
      sprite.emit();
    }
  };

  public destroy = () => {
    this.batch.clear();
    clearTimeout(this.batchTimeoutId);

    for (const sprite of this.sprites) {
      sprite.destroy();
    }
  };

  public action = (type: "add" | "unlink" | "change", file: string) => {
    const filePath = getRelativePosixFilePath(file);
    const assignedSprites = this.getAssignedSprites(filePath);

    clearTimeout(this.batchTimeoutId);

    for (const sprite of assignedSprites) {
      sprite.action(type, filePath);
      this.batch.add(sprite);
    }

    if (this.batch.size > 0) {
      this.batchTimeoutId = setTimeout(() => {
        this.batchEmit();
      }, 200);
    }
  };

  public isOutputFileMatch = (file: string) => {
    return this.options.some(({ output }) => {
      const filePath = getRelativePosixFilePath(file);

      return filePath === output;
    });
  };

  private batchEmit = () => {
    for (const sprite of this.batch) {
      sprite.emit();
    }

    this.batch.clear();
  };

  private getAssignedSprites = (filePath: string) => {
    return this.sprites.filter((sprite) => {
      return sprite.options.input.some((input) => {
        return filePath.startsWith(input.path);
      });
    });
  };
}
