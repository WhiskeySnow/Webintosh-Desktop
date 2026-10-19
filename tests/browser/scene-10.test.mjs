import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";
import { playScene, assertContinuity } from "./scenes.mjs";

const DAY_ANCHORS = { "day-1": 0, "day-4": 7500, "day-9": 13500, "day-23": 18500, "day-40": 22500, grid: 25000, "music-stop": 33000 };
const ACCEPTED_IN = { 1: 2.3, 4: 1.4, 9: 0.6, 23: 0.2 };

test("scene 10: many days, then the wall of screens", { timeout: 300000 }, () => withFilm({}, async ({ open }) => {
    const s9 = await playScene(open, 9, 4);
    const s10 = await playScene(open, 10, 1);
    const { film } = s10;

    for (const [beat, ms] of Object.entries(DAY_ANCHORS)) {
        const entry = film.log.find(e => e.beat === beat);
        const start = film.log.find(e => e.beat === "start");
        assert.ok(Math.abs(entry.actual - start.actual - ms) <= 50, `${beat} at ${entry.actual - start.actual}ms, want ${ms}`);
    }
    for (const [day, seconds] of Object.entries(ACCEPTED_IN)) {
        const lingered = film.beat(`accept-${day}`) - film.beat(`hover-${day}`);
        assert.ok(Math.abs(lingered - seconds * 1000) < 100, `day ${day} lingered ${lingered}ms`);
    }
    assert.ok(Math.abs(film.results.centerWidth - 1920 / 21) <= 2, `center screen ${film.results.centerWidth}px wide`);
    assert.ok(film.results.farDistinct >= 12, `${film.results.farDistinct} distinct far screens`);
    assert.equal(film.end.world.appearance, "light");
    assert.ok(film.end.messages.muted.includes("mia"));
    assert.ok(film.end.dock.running.includes("Music"));

    assertContinuity(s9, s10);
}));
