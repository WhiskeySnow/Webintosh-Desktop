import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";

test("Safari, Finder and Stickies behave like the script needs", { timeout: 90000 }, () => withFilm({}, async ({ open }) => {
    const page = await open("index.html?dev=dev-apps&rate=4");
    await page.waitFor("window.__film && (__film.done || __film.errors.length)", 60000);
    assert.deepEqual(await page.eval("__film.errors"), []);
    const r = await page.eval("__film.results");

    assert.match(r.docParagraph, /and I just$/);
    assert.equal(r.docText, "I just");
    assert.equal(r.siteHasDownload, true);
    assert.equal(r.activeTab, "VOLI — How well can an algorithm know you?");
    assert.equal(r.tabCount, 4);
    assert.equal(r.address, "voli.app");
    assert.equal(r.downloadItem, "VOLI.dmg");
    assert.equal(r.dmgHasVoli, true);
    assert.equal(r.dmgHasApplications, true);
    assert.equal(r.droppedOnApplications, true);
    assert.equal(r.appsHaveVoli, true);
    assert.equal(r.struck, "line-through");
    assert.equal(r.lastLineIsNew, true);
}));
