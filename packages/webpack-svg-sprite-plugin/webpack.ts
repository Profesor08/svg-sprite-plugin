import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "node:path";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import { WebpackSvgSpritePlugin } from "./src/webpack-plugin";

const compiler = webpack({
  mode: "development",

  infrastructureLogging: {
    level: "error",
  },

  entry: "./index.ts",

  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./index.html",
    }),
    new WebpackSvgSpritePlugin([
      {
        input: [
          {
            path: "../../icons/plain/",
            color: "currentColor",
          },
          {
            path: "../../icons/colored/",
          },
        ],
        output: "public/static/icons.svg",
        declaration: {
          path: "src/icons.d.ts",
          namespace: "Icons",
          export: false,
        },
      },
    ]),
  ],

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
});

const serverOptions = {
  static: {
    directory: path.resolve(process.cwd(), "public"),
  },
  hot: true,
  open: false,
  port: 3000,
};

if (compiler !== null) {
  const server = new WebpackDevServer(serverOptions, compiler);

  server.startCallback(() => {
    console.log("Dev server is running on http://localhost:3000");
  });
}
