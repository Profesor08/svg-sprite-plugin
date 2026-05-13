import { type Element } from "@xmldom/xmldom";

export interface SvgSpriteOptions {
  readonly input: SvgSpriteInput[];
  readonly output: string;
  readonly declaration?: SvgSpriteDeclaration;
}

export interface SvgSpriteDeclaration {
  /**
   * Output path
   */
  path: string;
  /**
   * Type name, default: Icons
   */
  namespace?: string;
  /**
   * Add export from declaration file, default: false
   */
  export?: boolean;
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

export interface SvgSpriteSymbol {
  readonly id: string;
  readonly symbol: Element;
}

export interface SvgSpriteInputBatch {
  readonly delete: Set<string>;
  readonly add: Set<string>;
  readonly change: Set<string>;
}
