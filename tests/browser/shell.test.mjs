import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";

const NAMES = [
    "Time-Based Media", "Screenshots", "pros and cons (3).docx", "transfer application (unsubmitted).pdf",
    "unsent.txt", "soundwalk_take4.wav", "midterm proposal FINAL (2).docx", "IMG_4471.HEIC",
    "Screenshot 2026-10-14 at 1.12.47 AM.png", "mia bday ideas.txt"
];

test("shell reflects the story world", { timeout: 60000 }, () => withFilm({}, async ({ open }) => {
    const page = await open("index.html?dev=dev-shell");
    await page.waitFor("window.__film && (__film.done || __film.errors.length)", 20000);
    assert.deepEqual(await page.eval("__film.errors"), []);
    const r = await page.eval("__film.results");

    assert.equal(r.clockBefore, "Wed Oct 14  11:47 PM");
    assert.equal(r.clockAfter, "Wed Oct 14  11:48 PM");
    assert.equal(r.battery, "23%");
    assert.deepEqual(r.dockDay, ["OCT", "14"]);
    assert.equal(r.mailBadge, "214");
    assert.deepEqual(r.names, NAMES);
    assert.equal(r.unsentSelection, "blur");
    assert.equal(r.firstBannerTitle, "TBM Midterm Proposal");
    assert.equal(r.soundsAfterTwo, 2);
    assert.equal(r.soundsAfterSilent, 2);
    assert.equal(r.lightAppearance, "light");
    assert.ok(r.lightBannerLuminance > 200, `banner luminance ${r.lightBannerLuminance}`);
    assert.equal(r.quitItem, true);
    assert.deepEqual(r.windows, [{ id: "a", visible: true, active: false }, { id: "b", visible: true, active: true }]);
    assert.equal(r.menuApp, "Messages");
}));

test("stage renders at 2x in a 4K window", { timeout: 60000 }, () => withFilm({ width: 3840, height: 2160 }, async ({ open }) => {
    const page = await open("index.html?dev=dev-shell");
    await page.waitFor("window.__film && __film.done", 20000);
    assert.equal(await page.eval("document.getElementById('stage').dataset.scale"), "2");
}));
