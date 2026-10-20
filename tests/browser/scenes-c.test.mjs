import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";
import { playScene, assertContinuity } from "./scenes.mjs";

test("scenes 7–9: autopilot, Mia again, can't quit", { timeout: 300000 }, () => withFilm({}, async ({ open }) => {
    const s6 = await playScene(open, 6);
    const s7 = await playScene(open, 7);
    const s8 = await playScene(open, 8);
    const s9 = await playScene(open, 9);

    assert.match(s7.film.end.docText, /I just let them\.$/);
    assert.deepEqual(s7.film.end.sticky[2], { text: "decide transfer by Fri??", struck: true });
    assert.deepEqual(s7.film.end.sticky.at(-1), { text: "decided: stay", struck: false });
    assert.ok(s7.film.end.desktop.includes("decided.docx"));
    assert.ok(!s7.film.end.desktop.includes("pros and cons (3).docx"));
    assert.deepEqual(s7.film.soundsBetween("start"), [], "autopilot makes no sound");

    assert.deepEqual(s8.film.soundsBetween("erase").filter(id => /^(send|key\d|space|return|click)$/.test(id)), []);
    assert.equal(s8.film.end.messages.lastMine, "no keep it");
    assert.ok(s8.film.soundsBetween("yeah-delete", "erase").includes("P5"));

    assert.ok(s9.film.end.extras.includes("voli"), "the menu bar icon survives quitting");
    assert.ok(s9.film.soundsBetween("error").includes("finderError"));

    assertContinuity(s6, s7);
    assertContinuity(s7, s8);
    assertContinuity(s8, s9);
}));
