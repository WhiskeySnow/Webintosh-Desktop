import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";

test("cursor and keyboard act like her or like VOLI", { timeout: 90000 }, () => withFilm({}, async ({ open }) => {
    const page = await open("index.html?dev=dev-input&rate=2");
    await page.waitFor("window.__film && __film.done", 60000);
    const r = await page.eval("__film.results");
    assert.deepEqual(await page.eval("__film.errors"), []);

    assert.equal(r.clicksA, 1, "human click reaches A");
    assert.equal(r.clickSoundsAfterHuman, 1, "her click makes a sound");
    assert.equal(r.clicksB, 1, "machine click reaches B");
    assert.equal(r.clickSoundsAfterMachine, 1, "VOLI's click is silent");

    assert.ok(r.untilFraction >= 0.6 && r.untilFraction <= 0.8, `stopped at ${r.untilFraction}`);

    assert.equal(r.machineValue, "no keep it");
    assert.equal(r.keySoundsDuringMachine, 0);

    assert.equal(r.humanValue, "what is it?");
    assert.ok(Math.abs(r.humanElapsed - r.p2Duration) < 100, `typed in ${r.humanElapsed}ms, voice ${r.p2Duration}ms`);
    assert.ok(r.p2Played);
    assert.ok(r.keySoundsDuringHuman >= 10, `${r.keySoundsDuringHuman} key sounds`);
}));
