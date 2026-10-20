import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";

const run = async (open, dev) => {
    const page = await open(`index.html?dev=${dev}&rate=4`);
    await page.waitFor("window.__film && (__film.done || __film.errors.length)", 30000);
    return page.eval("__film.overruns");
};

test("a voice that starts over another is reported", { timeout: 60000 }, () => withFilm({}, async ({ open }) => {
    const overruns = await run(open, "dev-voice-overlap");
    assert.equal(overruns.length, 1);
    assert.equal(overruns[0].kind, "voice-overlap");
    assert.equal(overruns[0].id, "M3");
    assert.ok(overruns[0].ms > 0);
}));

test("a voice still playing when its scene ends is reported", { timeout: 60000 }, () => withFilm({}, async ({ open }) => {
    const overruns = await run(open, "dev-voice-cut");
    assert.equal(overruns.length, 1);
    assert.equal(overruns[0].kind, "voice-cut");
    assert.equal(overruns[0].id, "M3");
}));
