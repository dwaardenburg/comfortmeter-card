// The preview page: builds the card with the project's own rspack config, plus the
// page's script, rebuilds both on save, and serves this folder on http://localhost:5181.
// Run it with `pnpm run preview`.
import { rspack } from "@rspack/core";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import cardConfig from "../rspack.config.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const base = cardConfig({}, { mode: "development" });

rspack({
  ...base,
  mode: "development",
  context: join(here, ".."),
  entry: { ...base.entry, preview: "./preview/main.ts" },
  output: { ...base.output, path: join(here, "dist") },
}).watch({}, (err, stats) => {
  if (err) console.error(err);
  else {
    console.log(
      stats.toString({
        all: false,
        errors: true,
        warnings: true,
        timings: true,
      })
    );
  }
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
}).listen(5181, "localhost", () => console.log("http://localhost:5181/"));
