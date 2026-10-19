// Screenshots a film URL once it has finished or reached its pause point.
// Usage: node tools/shoot.mjs --url "?scene=0&pause=1000" --out frame.png [--size 1920x1080]

import { parseArgs } from "node:util";
import { launchChrome } from "./cdp.mjs";
import { startServer } from "./serve.mjs";

const { values } = parseArgs({
    options: {
        url: { type: "string" },
        out: { type: "string" },
        size: { type: "string", default: "1920x1080" }
    }
});
const [width, height] = values.size.split("x").map(Number);

export async function shoot(query, out, { width = 1920, height = 1080 } = {}) {
    const server = await startServer({ port: 0 });
    const chrome = await launchChrome({ width, height });
    try {
        const page = await chrome.open(`${server.url}index.html${query.startsWith("?") ? query : `?${query}`}`);
        await page.waitFor("window.__film && (__film.frozen || __film.done || __film.errors.length > 0)", 180000);
        await new Promise(resolve => setTimeout(resolve, 400));
        await page.screenshot(out);
        return await page.eval("__film.errors");
    } finally {
        await chrome.close();
        await server.close();
    }
}

if (values.url && values.out) {
    const errors = await shoot(values.url, values.out, { width, height });
    if (errors.length) console.error(errors.join("\n"));
    console.log(values.out);
}
