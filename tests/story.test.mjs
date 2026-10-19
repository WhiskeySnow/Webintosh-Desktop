import test from "node:test";
import assert from "node:assert/strict";
import { SCENES, TIMELINE, VOICE_LINES, DAYS, DESKTOP_FILES, STICKY_LINES } from "../src/javascripts/film/data/story.js";

test("twelve scenes fit inside five minutes", () => {
    assert.equal(SCENES.length, 12);
    const total = SCENES.reduce((sum, scene) => sum + scene.targetMs, 0);
    assert.equal(total, 285000);
    assert.ok(total <= 300000);
    assert.equal(TIMELINE.length, 12);
});

test("voice lines are exactly the spec's fourteen", () => {
    const ids = VOICE_LINES.map(line => line.id).sort();
    assert.deepEqual(ids, ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "P1a", "P1b", "P2", "P3", "P4", "P5"].sort());
});

test("hesitation shrinks across the days", () => {
    assert.deepEqual(DAYS.map(day => day.acceptedIn), [2.3, 1.4, 0.6, 0.2, 0]);
});

test("desktop and sticky note match the spec", () => {
    assert.equal(DESKTOP_FILES.length, 10);
    assert.equal(DESKTOP_FILES[2].name, "pros and cons (3).docx");
    assert.equal(STICKY_LINES[2], "decide transfer by Fri??");
});
