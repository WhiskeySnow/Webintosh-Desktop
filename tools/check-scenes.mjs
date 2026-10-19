// Plays scenes in headless Chrome and checks timing, errors and network use.
// Usage: node tools/check-scenes.mjs [--scene N | --dev name] [--rate R] [--repeat K] [--export-log file.json]

import { writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { launchChrome } from "./cdp.mjs";
import { startServer } from "./serve.mjs";
import { SCENES } from "../src/javascripts/film/data/story.js";

const { values } = parseArgs({
    options: {
        scene: { type: "string" },
        dev: { type: "string" },
        rate: { type: "string", default: "1" },
        repeat: { type: "string", default: "1" },
        "export-log": { type: "string" }
    }
});

const rate = Number(values.rate);
const query = new URLSearchParams({ rate: String(rate) });
if (values.scene !== undefined) query.set("scene", values.scene);
if (values.dev !== undefined) query.set("dev", values.dev);
const expectedMs = values.scene !== undefined ? SCENES[Number(values.scene)].targetMs
    : values.dev !== undefined ? 60000
    : SCENES.reduce((sum, scene) => sum + scene.targetMs, 0);

async function playOnce() {
    const server = await startServer({ port: 0 });
    const chrome = await launchChrome({});
    try {
        const page = await chrome.open(`${server.url}index.html?${query}`);
        await page.waitFor("window.__film && (__film.done || __film.errors.length > 0)", expectedMs / rate + 30000);
        const state = await page.eval("({ log: __film.log, overruns: __film.overruns, errors: __film.errors, audioLog: __film.audioLog })");
        state.foreign = page.requests.filter(url => !url.startsWith(server.url) && !url.startsWith("data:"));
        return state;
    } finally {
        await chrome.close();
        await server.close();
    }
}

const failures = [];
const runs = [];
for (let i = 0; i < Number(values.repeat); i++) {
    runs.push(await playOnce());
}

const first = runs[0];
for (const id of new Set(first.log.map(entry => entry.scene))) {
    const start = first.log.find(entry => entry.scene === id && entry.beat === "start");
    const end = first.log.find(entry => entry.scene === id && entry.beat === "end");
    const target = SCENES.find(scene => scene.id === id)?.targetMs;
    const duration = end && start ? end.t - start.t : NaN;
    console.log(`${id}: ${(duration / 1000).toFixed(2)}s${target ? ` (target ${target / 1000}s)` : ""}`);
    if (target && !(Math.abs(duration - target) <= 300)) failures.push(`${id} ran ${duration}ms, target ${target}ms`);
}
for (const run of runs) {
    run.overruns.forEach(o => console.log(`overrun: ${o.scene} · ${o.beat} +${o.ms}ms`));
    run.errors.forEach(error => failures.push(`error: ${error}`));
    run.foreign.forEach(url => failures.push(`non-local request: ${url}`));
}
if (runs.length > 1) {
    let worst = 0;
    first.log.forEach((entry, i) => runs.slice(1).forEach(run => {
        worst = Math.max(worst, Math.abs((run.log[i]?.actual ?? Infinity) - entry.actual) / rate);
    }));
    console.log(`worst beat drift across ${runs.length} runs: ${worst.toFixed(0)}ms`);
    if (worst > 50) failures.push(`beat drift ${worst.toFixed(0)}ms > 50ms`);
}
if (values["export-log"]) {
    writeFileSync(values["export-log"], JSON.stringify(first.log, null, 2));
}

if (failures.length) {
    console.error(`FAIL\n${failures.join("\n")}`);
    process.exit(1);
}
console.log("OK");
