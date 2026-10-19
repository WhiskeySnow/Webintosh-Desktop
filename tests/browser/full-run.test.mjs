import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";

const VOLI_SILENT = [
    ["07-autopilot", "start", "end"],
    ["08-mia-again", "erase", "end"],
    ["11-pass-it-on", "start", "end"]
];

test("the whole film plays through inside five minutes", { timeout: 300000 }, () => withFilm({}, async ({ open, origin }) => {
    const page = await open("index.html?rate=4");
    await page.waitFor("window.__film && (__film.done || __film.errors.length)", 150000);
    const film = await page.eval("({ log: __film.log, errors: __film.errors, overruns: __film.overruns, audioLog: __film.audioLog })");

    assert.deepEqual(film.errors, []);
    assert.deepEqual(film.overruns, []);
    assert.equal(film.log.filter(e => e.beat === "start").length, 12);
    assert.ok(film.log.at(-1).t <= 300000, `ends at ${film.log.at(-1).t}ms`);
    assert.equal(film.log.at(-1).t, 285000);
    assert.ok(page.requests.every(url => url.startsWith(origin)), "only local requests");

    for (const [scene, fromBeat, toBeat] of VOLI_SILENT) {
        const from = film.log.find(e => e.scene === scene && e.beat === fromBeat).t;
        const to = film.log.find(e => e.scene === scene && e.beat === toBeat).t;
        const heard = film.audioLog.filter(e => e.t >= from && e.t < to).map(e => e.id);
        assert.deepEqual(heard, [], `${scene} ${fromBeat}→${toBeat} should be silent`);
    }
    const toggles = film.audioLog.filter(e => e.id === "toggle");
    assert.equal(toggles.length, 1, "VOLI's only sound is the Accessibility switch");
}));
