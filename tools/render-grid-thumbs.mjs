// Renders every wall screen for scene 10 to assets/film/grid/<id>.jpg.
// Usage: node tools/render-grid-thumbs.mjs

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { launchChrome } from "./cdp.mjs";
import { startServer } from "./serve.mjs";
import { GRID_VARIANTS } from "../src/javascripts/film/data/grid-variants.js";

const OUT = fileURLToPath(new URL("../assets/film/grid/", import.meta.url));
mkdirSync(OUT, { recursive: true });
const server = await startServer({ port: 0 });
const chrome = await launchChrome({});
try {
    for (const variant of GRID_VARIANTS) {
        const page = await chrome.open(`${server.url}index.html?thumb=${variant.id}`);
        await page.waitFor("window.__film && (__film.done || __film.errors.length)", 20000);
        const errors = await page.eval("__film.errors");
        if (errors.length) throw new Error(`${variant.id}: ${errors.join(", ")}`);
        await new Promise(resolve => setTimeout(resolve, 600));
        const png = join(tmpdir(), `${variant.id}.png`);
        await page.screenshot(png);
        execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "72", "-Z", "960", png, "--out", `${OUT}${variant.id}.jpg`], { stdio: "ignore" });
        rmSync(png);
        page.close();
        console.log(variant.id);
    }
} finally {
    await chrome.close();
    await server.close();
}
