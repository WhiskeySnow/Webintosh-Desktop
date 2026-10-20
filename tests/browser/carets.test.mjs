import test from "node:test";
import assert from "node:assert/strict";
import { withFilm } from "./harness.mjs";

test("text carets behave like macOS", { timeout: 60000 }, () => withFilm({}, async ({ open }) => {
    const page = await open("index.html?dev=dev-carets&rate=4");
    await page.waitFor("window.__film && (__film.done || __film.errors.length)", 30000);
    assert.deepEqual(await page.eval("__film.errors"), []);
    const r = await page.eval("__film.results");
    assert.equal(r.typed, "hi");
    assert.equal(r.messagesCaret, true, "Messages shows a caret while typing");
    assert.equal(r.caretSolidWhileTyping, true, "the caret stays solid while keys are pressed");
    assert.equal(r.docsCaretWhenInactive, false, "the Docs caret hides when Safari is in the background");
    assert.equal(r.messagesCaretWhenInactive, false);
    assert.equal(r.docsCaretWhenActive, true);
    assert.equal(r.sent, "hi");
    assert.equal(r.emptyAfterSend, true);
}));
