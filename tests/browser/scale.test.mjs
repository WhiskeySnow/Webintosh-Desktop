import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";

// OBS records at 3840×2160 (stage scale 2); the hesitation must still rest
// between the two buttons, touching neither.
test("scene 5 hesitates between the buttons at 4K", { timeout: 90000 }, () => withFilm({ width: 3840, height: 2160 }, async ({ open }) => {
    const page = await open("index.html?scene=5&pause=5600&rate=4");
    await page.waitFor("window.__film && (__film.frozen || __film.errors.length)", 60000);
    assert.deepEqual(await page.eval("__film.errors"), []);
    const hovered = await page.eval("[...document.querySelectorAll('.v-btn.is-hover')].map(b => b.textContent)");
    assert.deepEqual(hovered, []);
}));
