import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";

const limit = { timeout: 60000 };

const film = expression => `window.__film && ${expression}`;

test("dev scene runs, logs beats and records an overrun", limit, () => withFilm({}, async ({ open, origin }) => {
    const page = await open("index.html?dev=dev-anchors&rate=4");
    await page.waitFor(film("__film.done"), 15000);
    const state = await page.eval("({ log: __film.log, overruns: __film.overruns, errors: __film.errors })");
    assert.deepEqual(state.log.map(entry => entry.beat), ["start", "a", "b", "c", "end"]);
    assert.equal(state.overruns.length, 1);
    assert.ok(state.overruns[0].ms >= 350 && state.overruns[0].ms <= 450, `overrun ${state.overruns[0].ms}`);
    assert.deepEqual(state.errors, []);
    assert.ok(page.requests.every(url => url.startsWith(origin)), page.requests.join("\n"));
}));

test("an unknown scene shows a message instead of starting", limit, () => withFilm({}, async ({ open }) => {
    const page = await open("index.html?scene=99");
    await page.waitFor(film("__film.errors.length > 0"), 5000);
    assert.match(await page.eval("document.body.innerText"), /Unknown scene "99"\. Valid: 0–11/);
    assert.equal(await page.eval("__film.errors.length"), 1);
}));

test("without autoplay the film waits for a click", limit, () => withFilm({ autoplay: false }, async ({ open }) => {
    const page = await open("index.html?dev=dev-anchors&rate=4");
    await page.waitFor("document.body.innerText.includes('Click to start')", 5000);
    await new Promise(resolve => setTimeout(resolve, 2000));
    assert.equal(await page.eval("__film.log.length"), 0);
    await page.click(960, 540);
    await page.waitFor(film("__film.done"), 15000);
}));

test("stage scales up evenly in a 2560x1440 window", limit, () => withFilm({ width: 2560, height: 1440 }, async ({ open }) => {
    const page = await open("index.html?dev=dev-anchors&rate=4");
    await page.waitFor(film("true"), 5000);
    const rect = await page.eval("JSON.parse(JSON.stringify(document.getElementById('stage').getBoundingClientRect()))");
    assert.deepEqual([rect.x, rect.y, rect.width, rect.height].map(Math.round), [0, 0, 2560, 1440]);
}));

test("stage letterboxes in a 1280x800 window", limit, () => withFilm({ width: 1280, height: 800 }, async ({ open }) => {
    const page = await open("index.html?dev=dev-anchors&rate=4");
    await page.waitFor(film("true"), 5000);
    const rect = await page.eval("JSON.parse(JSON.stringify(document.getElementById('stage').getBoundingClientRect()))");
    assert.deepEqual([rect.x, rect.y, rect.width, rect.height].map(Math.round), [0, 40, 1280, 720]);
}));
