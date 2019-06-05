const dotenv = require("dotenv");
const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const ExtensionReloader = require("webpack-extension-reloader");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const pkg = require("../package.json");

const rootDir = path.join(__dirname, "../");
const srcDir = path.join(rootDir, "src");

dotenv.config();

const entry = {};
const plugins = [];

const page = process.env.PAGE;
const isUseExLoader = process.env.EX_LOADER;
let pages;

if (page) {
  if (isUseExLoader) {
    pages = ["background", "content"];
  } else {
    pages = [page];
  }
} else {
  pages = ["options", "background", "content", "view-tab"];
}

if (isUseExLoader) {
  plugins.push(
    new ExtensionReloader({
      entries: {
        manifest: path.resolve(__dirname, "../public/manifest.json"),
        contentScript: "content",
        background: "background",
      },
    }),
  );
}

pages.forEach(pageName => {
  entry[pageName] = path.join(srcDir, pageName, "index");

  plugins.push(
    new HtmlWebpackPlugin({
      title:
        pageName === "view-tab"
          ? "Remu"
          : `Remu - ${pageName.replace(/\w/, match => match.toUpperCase())}`,
      filename: `${pageName}.html`,
      root: pageName,
      template: path.join(rootDir, "public", "index.html"),
      chunks: [pageName],
    }),
  );
});

module.exports = {
  entry,
  output: {
    path: path.join(rootDir, "dist/"),
    filename: "js/[name].bundle.js",
  },
  optimization: {
    minimizer: [
      new TerserJSPlugin({
        parallel: true,
        terserOptions: {
          output: {
            comments: false,
          },
        },
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          happyPackMode: true,
          transpileOnly: true,
          experimentalWatchApi: true,
        },
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
          },
          {
            loader: "less-loader",
            options: {
              javascriptEnabled: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === "development",
            },
          },
          {
            loader: "css-loader",
          },
        ],
      },
      //   {
      //     test: /\.html$/,
      //     loader: "html-loader",
      //     options: {
      //       minimize: true,
      //       removeComments: false,
      //       collapseWhitespace: false
      //     }
      //   }
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    ...plugins,
    new ForkTsCheckerWebpackPlugin(),
    new CopyWebpackPlugin(
      [
        {
          from: "manifest.json",
          transform: function(content, path) {
            return Buffer.from(
              JSON.stringify({
                description: pkg.description,
                version: pkg.version,
                ...JSON.parse(content.toString()),
              }),
            );
          },
        },
        { from: ".", to: "." },
      ],
      { context: "public" },
    ),
    new MiniCssExtractPlugin({
      filename: "style/[name].css",
      chunkFilename: "[id].css",
    }),
    new Dotenv(),
  ],
};
