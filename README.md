# Vite Svg Sprite Plugin

**A Vite plugin that generates optimized SVG sprite files from directories of SVG icons. Supports multiple input/output configurations and is ideal for scalable icon management in modern front-end applications.**

---

## ✨ Features

- Generate one or more SVG sprite files from multiple icon directories
- Supports color replacement (`fill="currentColor"`)
- Automatically watches for changes during development (`serve` mode)
- Works well with inlined `<use>` references

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
            color: "currentColor", // Optional color replacement
          },
          {
            path: "public/static/icons/colored",
          },
        ],
        output: "public/static/icons.svg",
      },
      {
        input: [
          {
            path: "public/static/logos",
          },
        ],
        output: "public/static/logos.svg",
      },
    ]),
  ],
});
```

---

## ⚙️ Plugin Options

### `ViteSvgSpritePlugin(options: SvgSpriteOptions[])`

Each item in the array generates a separate SVG sprite file.

#### `SvgSpriteOptions`

| Option | Type               | Description                           |
| ------ | ------------------ | ------------------------------------- |
| input  | `SvgSpriteInput[]` | List of input directories and options |
| output | `string`           | Output path for the generated sprite  |

#### `SvgSpriteInput`

| Option | Type              | Description                                                |
| ------ | ----------------- | ---------------------------------------------------------- |
| path   | `string`          | Directory containing `.svg` icon files                     |
| color  | `"currentColor"`? | (Optional) Replaces fills with `currentColor` if specified |

---

## 🧪 Output Example

After build/start, the plugin will generate sprite files like `icons.svg` or `logos.svg`. You can reference the symbols in your HTML:

```html
<svg class="icon">
  <use href="/static/icons.svg#icon-name" />
</svg>
```

---

## 🛠 Development Behavior

This plugin only runs in **development mode** (`serve`). It watches for file changes in the specified directories and regenerates the sprite(s) on-the-fly.

---

## 📄 License

MIT
