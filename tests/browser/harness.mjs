// Shared helpers for browser tests: one static server per test file.

import { launchChrome } from "../../tools/cdp.mjs";
import { startServer } from "../../tools/serve.mjs";

export async function withFilm(options, fn) {
    const server = await startServer({ port: 0 });
    const chrome = await launchChrome(options);
    try {
        return await fn({
            open: path => chrome.open(new URL(path, server.url).href),
            origin: server.url
        });
    } finally {
        await chrome.close();
        await server.close();
    }
}
