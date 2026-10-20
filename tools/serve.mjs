// Local static server for the film (OBS points its browser source here).
// Usage: node tools/serve.mjs [port]

import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".wav": "audio/wav",
    ".woff2": "font/woff2",
    ".otf": "font/otf",
    ".ttf": "font/ttf"
};

export function startServer({ port = 8765, root = ROOT } = {}) {
    const server = createServer((request, response) => {
        const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
        const file = normalize(join(root, path.endsWith("/") ? `${path}index.html` : path));
        if (!file.startsWith(root)) {
            response.writeHead(403).end();
            return;
        }
        let size;
        try {
            const stats = statSync(file);
            if (!stats.isFile()) throw new Error("not a file");
            size = stats.size;
        } catch {
            response.writeHead(404).end("Not found");
            return;
        }
        const headers = {
            "Content-Type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream",
            "Accept-Ranges": "bytes",
            "Cache-Control": "no-store"
        };
        const range = /bytes=(\d*)-(\d*)/.exec(request.headers.range ?? "");
        if (range) {
            const start = range[1] ? Number(range[1]) : 0;
            const end = range[2] ? Number(range[2]) : size - 1;
            response.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1 });
            createReadStream(file, { start, end }).pipe(response);
            return;
        }
        response.writeHead(200, { ...headers, "Content-Length": size });
        createReadStream(file).pipe(response);
    });
    return new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, "127.0.0.1", () => resolve({
            url: `http://localhost:${server.address().port}/`,
            close: () => new Promise(done => {
                server.closeAllConnections();
                server.close(done);
            })
        }));
    });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const port = Number(process.argv[2] ?? 8765);
    const { url } = await startServer({ port });
    console.log(`Serving the film at ${url}`);
}
