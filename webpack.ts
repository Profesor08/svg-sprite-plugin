import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import { WebpackSvgSpritePlugin } from "./src/svg-sprite-webpack/WebpackSvgSpritePlugin";

const compiler = webpack({
  mode: "development",

  infrastructureLogging: {
    level: "error",
  },

  entry: "./src/svg-sprite-webpack/index.js",

  watchOptions: {
    aggregateTimeout: 200,
    poll: 1000,
    ignored: /node_modules/,
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/svg-sprite-webpack/index.html",
    }),
    new WebpackSvgSpritePlugin([
      {
        input: [
          {
            path: "./icons/plain/",
            color: "currentColor",
          },
          {
            path: "./icons/colored/",
          },
        ],
        output: "public/static/icons.svg",
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

const server = new WebpackDevServer(serverOptions, compiler);

server.startCallback(() => {
  console.log("Dev server is running on http://localhost:3000");
});
