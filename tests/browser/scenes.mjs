// Helpers for scene tests: play one scene and read its log and state.

import assert from "node:assert/strict";
import { SCENES } from "../../src/javascripts/film/data/story.js";

export async function playScene(open, index, rate = 4) {
    const page = await open(`index.html?scene=${index}&rate=${rate}`);
    await page.waitFor("window.__film && (__film.done || __film.errors.length)", SCENES[index].targetMs / rate + 30000);
    const film = await page.eval("({ log: __film.log, overruns: __film.overruns, errors: __film.errors, audioLog: __film.audioLog, setup: __film.setupSnapshot, end: __film.endSnapshot, results: __film.results ?? null, stillness: __film.stillness ?? null })");
    assert.deepEqual(film.errors, [], `scene ${index} errors`);
    const start = film.log.find(e => e.beat === "start").t;
    const end = film.log.find(e => e.beat === "end").t;
    assert.ok(Math.abs(end - start - SCENES[index].targetMs) <= 300, `scene ${index} ran ${end - start}ms`);
    assert.deepEqual(film.overruns, [], `scene ${index} overruns`);
    film.beat = name => film.log.find(e => e.beat === name)?.t - start;
    film.soundsBetween = (fromBeat, toBeat) => {
        const from = film.log.find(e => e.beat === fromBeat).t;
        const to = toBeat ? film.log.find(e => e.beat === toBeat).t : Infinity;
        return film.audioLog.filter(e => e.t >= from && e.t < to).map(e => e.id);
    };
    page.film = film;
    return page;
}

// Scene N's real end state must equal scene N+1's established start state.
export function assertContinuity(previous, next) {
    // The story clock jumps to the next scene's timeline entry by design.
    const strip = snapshot => ({ ...snapshot, notifications: undefined, world: undefined });
    assert.deepEqual(strip(previous.film.end), strip(next.film.setup));
}
