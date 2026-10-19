import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";
import { playScene, assertContinuity } from "./scenes.mjs";

test("scenes 3–6: questions, observation, responsibility, handover", { timeout: 300000 }, () => withFilm({}, async ({ open }) => {
    const s2 = await playScene(open, 2);
    const s3 = await playScene(open, 3);
    const s4 = await playScene(open, 4);
    const s5 = await playScene(open, 5);
    const s6 = await playScene(open, 6);

    const lingered = s3.film.beat("q4-choose") - s3.film.beat("q4-hover");
    assert.ok(lingered >= 2300 && lingered <= 2800, `lingered ${lingered}ms on Stay comfortable`);

    assert.equal(s4.film.end.voli, "observation");

    const scene5Sounds = s5.film.soundsBetween("start");
    assert.ok(scene5Sounds.includes("toggle"), "the toggle clicks");
    assert.deepEqual(scene5Sounds.filter(id => !["click", "toggle"].includes(id)), [], `unexpected: ${scene5Sounds}`);
    assert.ok(s5.film.end.extras.includes("voli"));

    assert.deepEqual(s6.film.soundsBetween("takeover"), [], "VOLI's cursor is silent");
    assert.equal(s6.film.end.voli, "thanks");

    assertContinuity(s2, s3);
    assertContinuity(s3, s4);
    assertContinuity(s4, s5);
    assertContinuity(s5, s6);
}));
