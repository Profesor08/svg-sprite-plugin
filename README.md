# Svg Sprite Plugin

[![npm](https://img.shields.io/npm/v/@prof-dev/svg-sprite-plugin.svg)](https://www.npmjs.com/package/@prof-dev/svg-sprite-plugin)
[![npm downloads](https://img.shields.io/npm/dm/@prof-dev/svg-sprite-plugin.svg)](https://www.npmjs.com/package/@prof-dev/svg-sprite-plugin)
[![license](https://img.shields.io/npm/l/@prof-dev/svg-sprite-plugin.svg)](./LICENSE)

**A plugin for Vite & Webpack that generates optimized SVG sprite files from directories of SVG icons. Supports multiple input/output configurations and is ideal for scalable icon management in modern front-end applications.**

---

## ✨ Features

- Generate one or more SVG sprite files from multiple icon directories
- Supports color replacement with any valid CSS color format
- Automatically watches for changes during development
- Works well with inlined `<use>` references
- Available for both Vite and Webpack projects

---

## 📦 Installation

```bash
npm install @prof-dev/svg-sprite-plugin --save-dev
```

or

```bash
yarn add -D @prof-dev/svg-sprite-plugin
```

---

## 🚀 Usage

### Vite

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { ViteSvgSpritePlugin } from "@prof-dev/svg-sprite-plugin";

export default defineConfig({
  plugins: [
    new ViteSvgSpritePlugin([
      {
        input: [
          {
            path: "public/static/icons/plain",
            color: "currentColor", // Dynamic color based on text color
          },
          {
            path: "public/static/icons/colored",
            // No color specified - preserves original colors
          },
          {
            path: "public/static/icons/themed",
            color: "var(--primary-color)", // Using CSS variable
          },
          {
            path: "public/static/icons/red",
            color: "#FF0000", // Using hex color
          },
        ],
        output: "public/static/icons.svg",
      },
      {
        input: [
          {
            path: "public/static/logos",
            color: "rgb(0, 128, 255)", // Using RGB color
          },
        ],
        output: "public/static/logos.svg",
      },
    ]),
  ],
});
```

### Webpack

```js
// webpack.config.js
const { WebpackSvgSpritePlugin } = require("@prof-dev/svg-sprite-plugin");

module.exports = {
  // ... other webpack configuration
  plugins: [
    new WebpackSvgSpritePlugin([
      {
        input: [
          {
            path: "public/static/icons/plain",
            color: "currentColor", // Dynamic color based on text color
          },
          {
            path: "public/static/icons/colored",
            // No color specified - preserves original colors
          },
          {
            path: "public/static/icons/themed",
            color: "hsl(210, 100%, 50%)", // Using HSL color
          },
        ],
        output: "static/icons.svg",
      },
      {
        input: [
          {
            path: "public/static/logos",
            color: "rgba(0, 128, 255, 0.8)", // Using RGBA with opacity
          },
        ],
        output: "static/logos.svg",
      },
    ]),
  ],
};
```

---

## ⚙️ Plugin Options

### Vite: `ViteSvgSpritePlugin(options: SvgSpriteOptions[])`

### Webpack: `WebpackSvgSpritePlugin(options: SvgSpriteOptions[])`

Both plugins use the same configuration format. Each item in the array generates a separate SVG sprite file.

#### `SvgSpriteOptions`

| Option | Type               | Description                           |
| ------ | ------------------ | ------------------------------------- |
| input  | `SvgSpriteInput[]` | List of input directories and options |
| output | `string`           | Output path for the generated sprite  |

#### `SvgSpriteInput`

| Option | Type      | Description                                              |
| ------ | --------- | -------------------------------------------------------- |
| path   | `string`  | Directory containing `.svg` icon files                   |
| color  | `string`? | (Optional) CSS color value to replace fills in SVG icons |

The `color` option supports any valid CSS color format:

- `currentColor` - Inherits color from the parent element's text color
- `#RRGGBB` or `#RGB` - Hexadecimal color values
- `rgb(R, G, B)` or `rgba(R, G, B, A)` - RGB/RGBA color values
- `hsl(H, S%, L%)` or `hsla(H, S%, L%, A)` - HSL/HSLA color values
- `var(--css-variable-name)` - CSS custom property variables
- Named colors like `red`, `blue`, `transparent`, etc.

If the `color` option is omitted, the original colors in the SVG files will be preserved.

---

## 🧪 Output Example

After build/start, the plugin will generate sprite files like `icons.svg` or `logos.svg`. You can reference the symbols in your HTML:

```html
<!-- Using with default styling (when color option was specified) -->
<svg class="icon">
  <use href="/static/icons.svg#icon-name" />
</svg>

<!-- Overriding with inline style -->
<svg class="icon" style="color: blue;">
  <use href="/static/icons.svg#icon-name" />
</svg>

<!-- Using with CSS classes -->
<svg class="icon primary-icon">
  <use href="/static/icons.svg#icon-name" />
</svg>
```

CSS example when using `currentColor`:

```css
.primary-icon {
  color: var(--primary-color);
}

.danger-icon {
  color: #ff0000;
}
```

---

## 🛠 Development Behavior

### Vite Plugin

The Vite plugin runs in **development mode** (`serve`). It watches for file changes in the specified directories and regenerates the sprite(s) on-the-fly.

### Webpack Plugin

The Webpack plugin supports **watch mode** and will regenerate sprite files when source SVGs are modified. During production builds, it integrates with Webpack's asset pipeline to output optimized sprite files.

---

## 📄 License

MIT
