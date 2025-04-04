import convertPath from "@stdlib/utils-convert-path";
import { DOMParser, Element, Node, XMLSerializer } from "@xmldom/xmldom";
import chokidar, { FSWatcher } from "chokidar";
import fg from "fast-glob";
import fs from "fs";
import path from "path";
import pretty from "pretty";

export interface SvgSpriteOptions {
  input: SvgSpriteInput[];
  output: string;
}

export interface SvgSpriteInput {
  path: string;
  color?: "currentColor";
}

interface SvgSpriteSymbol {
  id: string;
  symbol: Element;
}

interface SvgSpriteInputBatch {
  delete: Set<string>;
  add: Set<string>;
  change: Set<string>;
}

export class SvgSprite {
  private watcher: FSWatcher;
  private cache: Map<SvgSpriteInput, Map<string, SvgSpriteSymbol>>;
  private batch: Map<SvgSpriteInput, SvgSpriteInputBatch>;
  private batchTimeoutId: NodeJS.Timeout | undefined;

  constructor(private options: SvgSpriteOptions) {
    this.watcher = chokidar.watch(
      this.options.input.map((input) => input.path).flat(),
      {
        awaitWriteFinish: {
          stabilityThreshold: 1000,
          pollInterval: 100,
        },
      }
    );

    this.cache = new Map();

    this.batch = new Map();

    this.batchTimeoutId = undefined;
  }

  public start = () => {
    for (const input of this.options.input) {
      this.cache.set(input, this.createInputCache(input));

      const inputBatch: SvgSpriteInputBatch = {
        delete: new Set(),
        add: new Set(),
        change: new Set(),
      };

      this.batch.set(input, inputBatch);

      this.watcher.on("all", (eventName, filePath) => {
        const posixFilePath = convertPath(
          path.relative(process.cwd(), filePath),
          "posix"
        );

        if (posixFilePath.startsWith(input.path) === false) {
          return;
        }

        clearTimeout(this.batchTimeoutId);

        switch (eventName) {
          case "unlink":
            inputBatch.delete.add(posixFilePath);
            break;
          case "add":
            inputBatch.add.add(posixFilePath);
            break;
          case "change":
            inputBatch.change.add(posixFilePath);
            break;
        }

        this.batchTimeoutId = setTimeout(() => {
          this.updateSprite();
        }, 200);
      });
    }

    this.emit();
  };

  public stop = () => {
    this.watcher.close();
    this.cache.clear();
    this.batch.clear();
  };

  public emit = () => {
    const symbols = Array.from(this.cache.values())
      .map((inputCache) => Array.from(inputCache.values()))
      .flat()
      .sort((a, b) => {
        if (a.id < b.id) {
          return -1;
        } else if (a.id > b.id) {
          return 1;
        }

        return 0;
      })
      .map(({ symbol }) => symbol);

    const svg = new DOMParser().parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg"></svg>`,
      "text/xml"
    );

    for (const symbol of symbols) {
      svg.documentElement?.appendChild(symbol);
    }

    const serializedSvg = new XMLSerializer().serializeToString(svg);

    const prettiedSvg = pretty(serializedSvg);

    fs.writeFileSync(this.options.output, prettiedSvg);
  };

  private createInputCache = (input: SvgSpriteInput) => {
    const files = fg.sync(`${input.path}/**/*.svg`);

    const entries = files.map((filePath) => {
      const symbol = this.createSymbolFromFile(filePath, input.color);

      return [filePath, symbol] as const;
    });

    return new Map<string, SvgSpriteSymbol>(entries);
  };

  private createSymbolFromFile = (
    filePath: string,
    color?: string
  ): SvgSpriteSymbol => {
    const content = fs.readFileSync(filePath).toString();
    const svg = new DOMParser().parseFromString(content, "text/xml");

    const id = path.basename(filePath, path.extname(filePath));
    const width = svg.documentElement?.attributes.getNamedItem("width")?.value;
    const height =
      svg.documentElement?.attributes.getNamedItem("height")?.value;
    const viewBox = `0 0 ${width} ${height}`;

    const symbol = svg.createElementNS("http://www.w3.org/2000/svg", "symbol");

    symbol.setAttribute("id", id);

    if (width) {
      symbol.setAttribute("width", width?.toString());
    }

    if (height) {
      symbol.setAttribute("height", height?.toString());
    }

    symbol.setAttribute("viewBox", viewBox);

    symbol.setAttribute("fill", "none");

    Array.from(svg.documentElement?.childNodes ?? []).forEach((node) => {
      symbol.appendChild(this.replaceNodeColor(node, color));
    });

    return {
      id,
      symbol,
    };
  };

  private replaceNodeColor = (node: Node, color?: string): Node => {
    if (color !== undefined && node.nodeType === node.ELEMENT_NODE) {
      const fill = (node as Element).attributes?.getNamedItem("fill") ?? null;
      const stroke =
        (node as Element).attributes?.getNamedItem("stroke") ?? null;

      if (fill !== null) {
        fill.value = color;
      }

      if (stroke !== null) {
        stroke.value = color;
      }

      Array.from(node.childNodes ?? []).forEach((node) => {
        this.replaceNodeColor(node, color);
      });
    }

    return node;
  };

  private updateSprite = () => {
    for (const [input, inputBatch] of this.batch) {
      inputBatch.delete.forEach((filePath) => {
        this.delete(input, filePath);
      });

      inputBatch.change.forEach((filePath) => {
        this.change(input, filePath);
      });

      inputBatch.add.forEach((filePath) => {
        this.add(input, filePath);
      });

      inputBatch.delete.clear();
      inputBatch.change.clear();
      inputBatch.add.clear();
    }

    this.emit();
  };

  private add = (input: SvgSpriteInput, filePath: string) => {
    const symbol = this.createSymbolFromFile(filePath, input.color);

    this.cache.get(input)?.set(filePath, symbol);
  };

  private delete = (input: SvgSpriteInput, filePath: string) => {
    this.cache.get(input)?.delete(filePath);
  };

  private change = (input: SvgSpriteInput, filePath: string) => {
    this.delete(input, filePath);
    this.add(input, filePath);
  };
}
