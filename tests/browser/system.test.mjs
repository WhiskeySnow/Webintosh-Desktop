import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";

test("system dialogs and Accessibility settings use macOS wording", { timeout: 60000 }, () => withFilm({}, async ({ open }) => {
    const page = await open("index.html?dev=dev-system");
    await page.waitFor("window.__film && (__film.done || __film.errors.length)", 20000);
    assert.deepEqual(await page.eval("__film.errors"), []);
    const r = await page.eval("__film.results");

    assert.match(r.gatekeeper, /“VOLI” is an app downloaded from the Internet\. Are you sure you want to open it\?/);
    assert.match(r.gatekeeper, /Safari downloaded this file today at 11:49 PM from voli\.app\./);
    assert.deepEqual(r.gatekeeperButtons, ["Cancel", "Open"]);
    assert.match(r.prompt, /“VOLI” would like to control this computer using accessibility features\./);
    assert.match(r.prompt, /Grant access to this application in Privacy & Security settings, located in System Settings\./);
    assert.deepEqual(r.promptButtons, ["Open System Settings", "Deny"]);
    assert.match(r.trash, /The item “VOLI” can’t be moved to the Trash because it’s open\./);
    assert.equal(r.finderErrorPlayed, true);
    assert.deepEqual(r.rows, ["Raycast", "zoom.us", "VOLI"]);
    assert.equal(r.voliOnBefore, false);
    assert.equal(r.voliOnAfter, true);
    assert.equal(r.togglePlayed, true);
    assert.equal(r.settingsTitle, "Accessibility");
}));
