// Builds the card into one file, dist/comfortmeter-card.js, which HACS serves as the card's resource.
import { defineConfig } from "@rspack/cli";

export default defineConfig((_env, argv) => ({
  entry: { "comfortmeter-card": "./src/comfortmeter-card.ts" },
  output: {
    filename: "[name].js",
    clean: true,
    module: true,
    chunkFormat: "module",
  },
  experiments: { outputModule: true },
  resolve: { extensions: [".ts", ".js"] },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: "builtin:swc-loader",
        options: {
          jsc: {
            parser: { syntax: "typescript", decorators: true },
            transform: {
              legacyDecorator: true,
              useDefineForClassFields: false,
            },
            target: "es2021",
          },
        },
        type: "javascript/auto",
      },
    ],
  },
  optimization: { splitChunks: false },
  devtool: argv.mode === "development" ? "inline-source-map" : false,
  performance: { hints: false },
}));
