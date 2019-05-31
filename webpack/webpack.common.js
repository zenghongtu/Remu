const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const ExtensionReloader = require("webpack-extension-reloader");
const pkg = require("../package.json");
const rootDir = path.join(__dirname, "../");
const srcDir = path.join(rootDir, "src");

const pages = ["popup", "options", "background", "content"];
const entry = {};
const plugins = [];

pages.forEach(pageName => {
  entry[pageName] = path.join(srcDir, pageName, "index");

  plugins.push(
    new HtmlWebpackPlugin({
      title:
        pageName === "newtab"
          ? "A Tab with 30 Seconds"
          : `A Tab with 30 Seconds - ${pageName.replace(/\w/, match =>
              match.toUpperCase()
            )}`,
      filename: `${pageName}.html`,
      root: pageName,
      template: path.join(rootDir, "public", "index.html"),
      chunks: [pageName]
    })
  );
});

module.exports = {
  mode: "development",
  entry,
  output: {
    path: path.join(rootDir, "dist/"),
    filename: "js/[name].bundle.js"
  },
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist"
  },
  // optimization: {
  //   minimizer: [
  //     new UglifyJsPlugin({
  //       cache: true,
  //     }),
  //   ],
  // },
  optimization: {
    minimizer: [
      new TerserJSPlugin({
        parallel: true,
        terserOptions: {
          output: {
            comments: false
          }
        }
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === "development"
            }
          },
          {
            loader: "css-loader"
          },
          {
            loader: "less-loader"
          }
        ]
      }
      //   {
      //     test: /\.html$/,
      //     loader: "html-loader",
      //     options: {
      //       minimize: true,
      //       removeComments: false,
      //       collapseWhitespace: false
      //     }
      //   }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  plugins: [
    ...plugins,
    new CopyWebpackPlugin(
      [
        {
          from: "manifest.json",
          transform: function(content, path) {
            return Buffer.from(
              JSON.stringify({
                description: pkg.description,
                version: pkg.version,
                ...JSON.parse(content.toString())
              })
            );
          }
        },
        { from: ".", to: "." }
      ],
      { context: "public" }
    ),
    new MiniCssExtractPlugin({
      filename: "style/[name].css",
      chunkFilename: "[id].css"
    }),
    new ExtensionReloader({
      entries: {
        contentScript: "content",
        background: "background"
      }
    })
  ]
};
