import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";

const limit = { timeout: 60000 };
const VOICES = ["P1a", "P1b", "P2", "P3", "P4", "P5", "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"];

test("every voice line loads with a real duration", limit, () => withFilm({}, async ({ open }) => {
    const page = await open("index.html?dev=dev-sound");
    await page.waitFor("window.__film && __film.done", 20000);
    const durations = await page.eval(`${JSON.stringify(VOICES)}.map(id => __film.sound.duration(id))`);
    durations.forEach((ms, i) => assert.ok(ms > 200, `${VOICES[i]} is ${ms}ms`));
    assert.deepEqual(await page.eval("__film.errors"), []);
}));

test("plays are logged in order", limit, () => withFilm({}, async ({ open }) => {
    const page = await open("index.html?dev=dev-sound");
    await page.waitFor("window.__film && __film.done", 20000);
    assert.deepEqual(await page.eval("__film.audioLog.map(entry => entry.id)"), ["key1", "send"]);
}));

test("a missing file is reported and estimated, not fatal", limit, () => withFilm({}, async ({ open }) => {
    const page = await open("index.html?dev=dev-sound-missing");
    await page.waitFor("window.__film && __film.done", 20000);
    assert.ok((await page.eval("__film.errors")).includes("missing:MISSING"));
    assert.equal(await page.eval("__film.sound.duration('MISSING')"), 600);
}));
