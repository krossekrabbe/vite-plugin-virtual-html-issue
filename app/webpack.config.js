import * as path from "path";
import { fileURLToPath } from "url";

import Transformer from "@formatjs/ts-transformer";
import Dotenv from "dotenv-webpack";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import SpeedMeasurePlugin from "speed-measure-webpack-plugin";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import webpack from "webpack";

// Speed measure plugin logs detailed timing stats to the console
const smp = new SpeedMeasurePlugin();

const mode = process.env.NODE_ENV || "development";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.info(`Building for ${mode} environment.`);

// eslint-disable-next-line import/no-default-export
export default smp.wrap({
  cache: {
    type: "filesystem",
  },
  mode,
  entry: "./src/index.tsx",
  devtool: mode === "development" ? "eval-cheap-source-map" : "hidden-source-map",
  // Export warnings are ignored in accordance with
  // https://github.com/TypeStrong/ts-loader#transpileonly
  ignoreWarnings: [/export .* was not found in/],
  devServer: {
    host: "0.0.0.0",
    port: 8080,
    webSocketServer: "ws",
    hot: true,
    liveReload: false,
    compress: true,
    static: {
      // Default dir with latest webpack-dev-server is "public",
      // but we've been using "dist".
      directory: path.join(__dirname, "dist"),
    },
    historyApiFallback: {
      rewrites: [{ from: /./, to: "/index.html" }],
    },
    client: {
      webSocketURL: "auto://0.0.0.0:0/ws",
    },
    allowedHosts: "all",
  },
  plugins: [
    new webpack.DefinePlugin({
      __webpack_nonce__: "window.__CSP_NONCE",
      "import.meta.hot": import.meta.webpackHot,
    }),
    // Dynamically generates the ./dist/index.html file and includes the bundled js
    new HtmlWebpackPlugin({
      template: "./public/webpack.index.html",
      publicPath: "/",
      favicon: "./public/icon.svg",
    }),
    new Dotenv({
      defaults: true,
      systemvars: true,
    }),
    // Enables type-checking in a separate thread, used in conjunction with
    // ts-loader's transpileOnly option.
    new ForkTsCheckerWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /\.yarn/,
        use: [
          {
            loader: "ts-loader",
            options: {
              // Use transpileOnly together with ForkTsCheckerWebpackPlugin
              transpileOnly: true,
              logInfoToStdOut: true,
              logLevel: "info",
              getCustomTransformers() {
                return {
                  before: [
                    Transformer.transform({
                      overrideIdFn: "[sha512:contenthash:base64:6]",
                      ast: true,
                    }),
                  ],
                };
              },
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    plugins: [
      // Makes the aliases defined in tsconfig.json work with webpack
      new TsconfigPathsPlugin({
        logLevel: "INFO",
        // Extensions must be repeated here exactly as above, because
        // TsconfigPathsPlugin does and cannot access the configured resolver
        // extensions.
        extensions: [".tsx", ".ts", ".js"],
      }),
    ],
  },
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    // We used clean-webpack-plugin before, but with webpack v5 the clean option
    // has been provided. Also, the clean plugin added 2s to the rebuild time for
    // some reason.
    clean: true,
  },
  optimization: {
    moduleIds: "deterministic",
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        // This will create a separate vendor chunk and therefore allows users'
        // browsers to cache that chunk for a longer time until it gets updated.
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
  externals: {
    fs: "commonjs fs",
    path: "commonjs path",
  },
});
