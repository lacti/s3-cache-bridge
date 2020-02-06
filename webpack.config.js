const path = require("path");

module.exports = {
  mode: "production",
  entry: path.join(__dirname, "src", "index.ts"),
  devtool: "inline-source-map",
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  },
  target: "node",
  externals: [/aws-sdk/],
  module: {
    rules: [{ test: /\.tsx?$/, loader: "ts-loader" }]
  }
};
