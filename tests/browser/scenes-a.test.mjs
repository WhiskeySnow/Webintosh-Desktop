import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";
import { playScene, assertContinuity } from "./scenes.mjs";

test("scenes 0–2: cold open, Mia, install", { timeout: 240000 }, () => withFilm({}, async ({ open }) => {
    const s0 = await playScene(open, 0);
    const s1 = await playScene(open, 1);
    const s2 = await playScene(open, 2);

    assert.equal(s0.film.end.docText, "I just");
    assert.deepEqual(s0.film.end.selection, { name: "pros and cons (3).docx", state: "focus" });
    assert.ok(s0.film.soundsBetween("retype-1", "delete-2").includes("P1a"));
    assert.ok(s0.film.soundsBetween("mia-notify").includes("M1"));

    assert.equal(s1.film.end.messages.links, 1);
    assert.equal(s1.film.end.messages.open, "mia");
    assert.ok(s1.film.soundsBetween("type-what", "read-1").includes("P2"));

    assert.ok(s2.film.end.dock.running.includes("VOLI"));
    assert.equal(s2.film.end.voli, "welcome");

    assertContinuity(s0, s1);
    assertContinuity(s1, s2);
}));
