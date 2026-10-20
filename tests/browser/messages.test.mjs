import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";

test("Messages behaves like macOS Messages", { timeout: 60000 }, () => withFilm({}, async ({ open }) => {
    const page = await open("index.html?dev=dev-messages");
    await page.waitFor("window.__film && (__film.done || __film.errors.length)", 20000);
    assert.deepEqual(await page.eval("__film.errors"), []);
    const r = await page.eval("__film.results");

    assert.equal(r.header, "To: Mia Chen");
    assert.deepEqual(r.rows, ["Jordan (TBM)", "Sam Okafor", "Daniel Kim", "Dad", "32665"]);
    assert.equal(r.miaPinnedCurrent, true);
    assert.equal(r.danielLabel, "Monday");
    assert.equal(r.dadLabel, "Sunday");
    assert.equal(r.danielLabelLater, "10/12/26");
    assert.deepEqual(r.tails, [false, false, true]);
    assert.equal(r.sentText, "send it lol");
    assert.equal(r.sendSounds, 1);
    assert.equal(r.sendSoundsAfterSilent, 1);
    assert.equal(r.typingShown, true);
    assert.equal(r.typingGone, true);
    assert.equal(r.receipt, "Read 11:48 PM");
    assert.equal(r.linkTitle, "VOLI — How well can an algorithm know you?");
}));
