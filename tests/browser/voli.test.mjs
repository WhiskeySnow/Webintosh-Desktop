import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";

test("VOLI screens carry the script's exact words", { timeout: 60000 }, () => withFilm({}, async ({ open }) => {
    const page = await open("index.html?dev=dev-voli");
    await page.waitFor("window.__film && (__film.done || __film.errors.length)", 20000);
    assert.deepEqual(await page.eval("__film.errors"), []);
    const r = await page.eval("__film.results");

    assert.match(r.welcome, /Let’s get to know you\./);
    assert.match(r.welcome, /Five quick choices\. There are no right answers\./);
    assert.match(r.welcome, /Get Started/);
    assert.match(r.question, /Getting to know you · 4 of 5/);
    assert.match(r.question, /Would you rather know the truth, or stay comfortable\?/);
    assert.equal(r.optionFound, true);
    assert.match(r.observation, /You hovered over “Stay comfortable” for 2\.3 seconds\./);
    assert.match(r.observation, /Stay comfortable\s*2\.3 s/);
    assert.match(r.observation, /Know the truth\s*0\.4 s/);
    assert.match(r.observation, /Hover time before you chose “Know the truth\.”/);
    assert.equal(r.lineAfterCard, true);
    assert.equal(r.lineText, "You deleted “I just” twice before Mia texted you.");
    assert.match(r.autopilot, /Deciding is tiring\./);
    assert.match(r.autopilot, /You don’t have to decide\. If it’s wrong, it’s on me\./);
    assert.match(r.autopilot, /Turn On Autopilot/);
    assert.match(r.control, /Do you feel in control\?/);
    assert.match(r.thanks, /Thank you\.\s*I knew you would\./);
    assert.match(r.daily, /Transfer — Stay \(application withdrawn\)/);
    assert.match(r.daily, /TBM proposal — Submitted/);
    assert.equal(r.acceptedText, "Accepted in 0.6 s");
}));
