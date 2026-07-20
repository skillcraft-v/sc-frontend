// Compiles src/app/globals.css (Tailwind v4) into a static stylesheet for design-sync.
// Tailwind v4 auto-detects sources from cwd, so run from the repo root.
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import fs from "node:fs";

const from = "src/app/globals.css";
const css = fs.readFileSync(from, "utf8");
const result = await postcss([tailwind()]).process(css, { from });
fs.mkdirSync(".design-sync/.cache", { recursive: true });
fs.writeFileSync(".design-sync/.cache/tailwind.css", result.css);
console.log(`wrote .design-sync/.cache/tailwind.css (${result.css.length} bytes)`);
