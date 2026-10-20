import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";
import { playScene } from "./scenes.mjs";

test("scene 3 never freezes her cursor for more than 3 seconds", { timeout: 120000 }, () => withFilm({}, async ({ open }) => {
    const { film } = await playScene(open, 3, 1);
    assert.ok(film.stillness?.["03-questions"] < 3000, `longest still stretch ${film.stillness?.["03-questions"]}ms`);
}));

test("the takeover in scene 6 is long enough to see", { timeout: 120000 }, () => withFilm({}, async ({ open }) => {
    const { film } = await playScene(open, 6, 4);
    const reach = film.beat("takeover") - film.beat("reach-no");
    const glide = film.beat("thanks") - film.beat("takeover");
    assert.ok(reach >= 800, `her reach toward No lasts ${reach}ms`);
    assert.ok(glide >= 350, `VOLI's glide to Yes lasts ${glide}ms`);
}));
