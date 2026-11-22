// Throwaway prototype for #2: rebuilds main.ts on save and serves this folder on
// http://localhost:5180. Run from the repo root: node prototype/dial/serve.mjs
import { rspack } from "@rspack/core";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

rspack({
  mode: "development",
  context: here,
  entry: { main: "./main.ts" },
  output: {
    path: join(here, "dist"),
    filename: "[name].js",
    module: true,
    chunkFormat: "module",
  },
  experiments: { outputModule: true },
  resolve: { extensions: [".ts", ".js"] },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "builtin:swc-loader",
        options: {
          jsc: { parser: { syntax: "typescript" }, target: "es2021" },
        },
        type: "javascript/auto",
      },
    ],
  },
  devtool: "inline-source-map",
}).watch({}, (err, stats) => {
  if (err) console.error(err);
  else
    console.log(
      stats.toString({
        all: false,
        errors: true,
        warnings: true,
        timings: true,
      })
    );
});

const types = { ".html": "text/html", ".js": "text/javascript" };
createServer(async (req, res) => {
  const path = normalize(new URL(req.url, "http://x").pathname).replace(
    /^[\\/]+/,
    ""
  );
  try {
    const file = path || "index.html";
    const body = await readFile(join(here, file));
    res.writeHead(200, {
      "content-type": types[extname(file)] ?? "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(5180, "localhost", () =>
  console.log("http://localhost:5180/?variant=F")
);
