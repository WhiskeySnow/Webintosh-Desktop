import test from "node:test";
import assert from "node:assert/strict";
import { Timeline } from "../src/javascripts/film/clock.js";

function fakeTimeline(options = {}) {
    const clock = { now: 0 };
    const timeline = new Timeline({
        now: () => clock.now,
        sleep: async () => { clock.now += 5; },
        ...options
    });
    return { clock, timeline };
}

test("wait advances the scheduled cursor and resolves once time reaches it", async () => {
    const { timeline } = fakeTimeline();
    timeline.start();
    await timeline.wait(100);
    await timeline.wait(100);
    assert.equal(timeline.cursor, 200);
    assert.ok(timeline.t >= 200);
});

test("rate scales elapsed time", () => {
    const { clock, timeline } = fakeTimeline({ rate: 4 });
    timeline.start();
    clock.now += 50;
    assert.equal(timeline.t, 200);
});

test("until never moves the cursor backwards", async () => {
    const { timeline } = fakeTimeline();
    timeline.start();
    await timeline.wait(200);
    await timeline.until(50);
    assert.equal(timeline.cursor, 200);
});

test("animate reports monotonic progress ending at exactly 1", async () => {
    const { timeline } = fakeTimeline();
    timeline.start();
    const seen = [];
    await timeline.animate(100, p => seen.push(p));
    assert.equal(seen.at(-1), 1);
    for (let i = 1; i < seen.length; i++) {
        assert.ok(seen[i] >= seen[i - 1], `progress went backwards at ${i}`);
    }
    assert.equal(timeline.cursor, 100);
});

test("freezeAt caps time and holds waits that reach past it", async () => {
    const { clock, timeline } = fakeTimeline();
    timeline.start();
    timeline.freezeAt(150);
    clock.now = 10_000;
    assert.equal(timeline.t, 150);

    const outcome = await Promise.race([
        timeline.wait(200).then(() => "resolved"),
        new Promise(resolve => setTimeout(() => resolve("pending"), 30))
    ]);
    assert.equal(outcome, "pending");
});
