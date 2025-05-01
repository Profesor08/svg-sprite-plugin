import { DOMParser, Element, Node, XMLSerializer } from "@xmldom/xmldom";
import fg from "fast-glob";
import fs from "fs";
import path from "path";
import pretty from "pretty";
import { getRelativePosixFilePath } from "../utils/path";

export interface SvgSpriteOptions {
  readonly input: SvgSpriteInput[];
  readonly output: string;
}

export interface SvgSpriteInput {
  readonly path: string;
  readonly color?: string;
  readonly symbolAttributes?: SvgSpriteSymbolAttributes;
}

export interface SvgSpriteSymbolAttributes {
  width?: boolean;
  height?: boolean;
  viewBox?: boolean;
  fill?: boolean;
}

interface SvgSpriteSymbol {
  readonly id: string;
  readonly symbol: Element;
}

interface SvgSpriteInputBatch {
  readonly delete: Set<string>;
  readonly add: Set<string>;
  readonly change: Set<string>;
}

export class SvgSprite {
  public readonly options: SvgSpriteOptions;

  private readonly cache: Map<SvgSpriteInput, Map<string, SvgSpriteSymbol>>;
  private readonly batch: Map<SvgSpriteInput, SvgSpriteInputBatch>;

  constructor(options: SvgSpriteOptions) {
    this.options = options;
    this.cache = new Map();
    this.batch = new Map();

    for (const input of this.options.input) {
      this.cache.set(input, createInputCache(input));

      const inputBatch: SvgSpriteInputBatch = {
        delete: new Set(),
        add: new Set(),
        change: new Set(),
      };

      this.batch.set(input, inputBatch);
    }
  }

  public destroy = () => {
    this.cache.clear();
    this.batch.clear();
  };

  public emit = () => {
    const symbols = Array.from(this.cache.values())
      .map((inputCache) =>
        Array.from(inputCache.values()).sort((a, b) => {
          if (a.id < b.id) {
            return -1;
          } else if (a.id > b.id) {
            return 1;
          }

          return 0;
        }),
      )
      .flat()
      .map(({ symbol }) => symbol);

    const svg = new DOMParser().parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg"></svg>`,
      "text/xml",
    );

    for (const symbol of symbols) {
      svg.documentElement?.appendChild(symbol);
    }

    const serializedSvg = new XMLSerializer().serializeToString(svg);

    const prettiedSvg = pretty(serializedSvg);

    fs.writeFileSync(this.options.output, prettiedSvg);
  };

  public action = (type: "add" | "unlink" | "change", file: string) => {
    const filePath = getRelativePosixFilePath(file);
    const assignedInputs = this.getAssignedInputs(filePath);

    for (const input of assignedInputs) {
      switch (type) {
        case "add":
          this.add(input, filePath);
          break;
        case "unlink":
          this.unlink(input, filePath);
          break;
        case "change":
          this.change(input, filePath);
          break;
      }
    }
  };

  private getAssignedInputs = (filePath: string) => {
    return this.options.input.filter((input) => {
      return filePath.startsWith(input.path);
    });
  };

  private add = (input: SvgSpriteInput, filePath: string) => {
    const symbol = createSymbolFromFile(
      filePath,
      input.color,
      input.symbolAttributes,
    );

    this.cache.get(input)?.set(filePath, symbol);
  };

  private unlink = (input: SvgSpriteInput, filePath: string) => {
    this.cache.get(input)?.delete(filePath);
  };

  private change = (input: SvgSpriteInput, filePath: string) => {
    this.unlink(input, filePath);
    this.add(input, filePath);
  };
}

const createSymbolFromFile = (
  filePath: string,
  color?: string,
  attributes?: SvgSpriteSymbolAttributes,
): SvgSpriteSymbol => {
  const content = fs.readFileSync(filePath).toString();
  const svg = new DOMParser().parseFromString(content, "text/xml");

  const id = path.basename(filePath, path.extname(filePath));
  const width = svg.documentElement?.attributes.getNamedItem("width")?.value;
  const height = svg.documentElement?.attributes.getNamedItem("height")?.value;

  const symbol = svg.createElementNS("http://www.w3.org/2000/svg", "symbol");

  symbol.setAttribute("id", id);

  if (attributes?.width === true && width !== undefined) {
    symbol.setAttribute("width", width.toString());
  }

  if (attributes?.height === true && height !== undefined) {
    symbol.setAttribute("height", height.toString());
  }

  if (
    attributes?.viewBox !== false &&
    width !== undefined &&
    height !== undefined
  ) {
    symbol.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  if (attributes?.fill !== false) {
    symbol.setAttribute("fill", "none");
  }

  Array.from(svg.documentElement?.childNodes ?? []).forEach((node) => {
    symbol.appendChild(replaceNodeColor(node, color));
  });

  return {
    id,
    symbol,
  };
};

const replaceNodeColor = (node: Node, color?: string): Node => {
  if (color !== undefined && node.nodeType === node.ELEMENT_NODE) {
    const fill = (node as Element).attributes.getNamedItem("fill") ?? null;
    const stroke = (node as Element).attributes.getNamedItem("stroke") ?? null;

    if (fill !== null) {
      fill.value = color;
    }

    if (stroke !== null) {
      stroke.value = color;
    }

    // childNodes possibly to be null
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    Array.from(node.childNodes ?? []).forEach((node) => {
      replaceNodeColor(node, color);
    });
  }

  return node;
};

const createInputCache = (input: SvgSpriteInput) => {
  const files = fg.sync(`${input.path}/**/*.svg`);

  const entries = files.map((filePath) => {
    const symbol = createSymbolFromFile(filePath, input.color);

    return [filePath, symbol] as const;
  });

  return new Map<string, SvgSpriteSymbol>(entries);
};
