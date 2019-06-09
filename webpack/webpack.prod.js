const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");
const pkg = require("../package.json");

module.exports = merge(common, {
  mode: "production",
  devtool: false,
  plugins: [
    new CleanWebpackPlugin(),
    new ZipPlugin({
      path: path.join(__dirname, "../"),
      filename: `${pkg.name}-build-${pkg.version}`,
      extension: "zip",
    }),
  ],
});
