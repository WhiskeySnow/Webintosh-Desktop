// Headless Chrome with a minimal DevTools Protocol client (Node built-ins only).

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function launchChrome({ width = 1920, height = 1080, autoplay = true } = {}) {
    const profile = mkdtempSync(join(tmpdir(), "film-chrome-"));
    const args = [
        "--headless=new",
        "--hide-scrollbars",
        "--no-first-run",
        "--no-default-browser-check",
        "--force-device-scale-factor=1",
        "--remote-debugging-port=0",
        `--user-data-dir=${profile}`,
        `--window-size=${width},${height}`,
        `--autoplay-policy=${autoplay ? "no-user-gesture-required" : "document-user-activation-required"}`,
        "about:blank"
    ];
    const proc = spawn(CHROME, args, { stdio: ["ignore", "ignore", "pipe"], detached: true });
    const pages = [];
    const port = await new Promise((resolve, reject) => {
        let buffer = "";
        const timer = setTimeout(() => reject(new Error("Chrome did not start")), 15000);
        proc.stderr.on("data", chunk => {
            buffer += chunk;
            const match = /DevTools listening on ws:\/\/[^:]+:(\d+)\//.exec(buffer);
            if (match) {
                clearTimeout(timer);
                resolve(Number(match[1]));
            }
        });
        proc.once("exit", code => reject(new Error(`Chrome exited (${code})`)));
    });
    const http = `http://127.0.0.1:${port}`;

    return {
        async open(url) {
            const target = await (await fetch(`${http}/json/new?about:blank`, { method: "PUT" })).json();
            const page = await connectPage(target, { width, height });
            pages.push(page);
            await page.navigate(url);
            return page;
        },
        async close() {
            pages.forEach(page => page.close());
            proc.stderr.destroy();
            try {
                process.kill(-proc.pid, "SIGKILL");
            } catch {
                // already gone
            }
            await sleep(200);
            rmSync(profile, { recursive: true, force: true });
        }
    };
}

async function connectPage(target, { width, height }) {
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
        socket.onopen = resolve;
        socket.onerror = reject;
    });
    let nextId = 1;
    const pending = new Map();
    const listeners = new Map();
    socket.onmessage = event => {
        const message = JSON.parse(event.data);
        if (message.id && pending.has(message.id)) {
            const { resolve, reject } = pending.get(message.id);
            pending.delete(message.id);
            message.error ? reject(new Error(message.error.message)) : resolve(message.result);
        } else if (message.method) {
            (listeners.get(message.method) ?? []).forEach(fn => fn(message.params));
        }
    };
    const send = (method, params = {}) => new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
    });
    const on = (method, fn) => listeners.set(method, [...(listeners.get(method) ?? []), fn]);

    const requests = [];
    on("Network.requestWillBeSent", params => requests.push(params.request.url));
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Network.enable");
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });

    const page = {
        requests,
        async navigate(url, timeoutMs = 20000) {
            const loaded = new Promise(resolve => on("Page.loadEventFired", resolve));
            await send("Page.navigate", { url });
            await Promise.race([
                loaded,
                sleep(timeoutMs).then(() => { throw new Error(`Page did not load within ${timeoutMs}ms: ${url}`); })
            ]);
        },
        async eval(expression) {
            const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
            if (result.exceptionDetails) {
                throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
            }
            return result.result.value;
        },
        async waitFor(expression, timeoutMs = 30000) {
            const deadline = performance.now() + timeoutMs;
            while (performance.now() < deadline) {
                if (await page.eval(`Boolean(${expression})`)) return;
                await sleep(100);
            }
            throw new Error(`Timed out waiting for: ${expression}`);
        },
        async screenshot(path) {
            const { data } = await send("Page.captureScreenshot", { format: "png" });
            writeFileSync(path, Buffer.from(data, "base64"));
        },
        async click(x, y) {
            for (const type of ["mousePressed", "mouseReleased"]) {
                await send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
            }
        },
        close() {
            socket.close();
        }
    };
    return page;
}
