import test from "node:test";
import assert from "node:assert/strict";
import {
    formatMenuClock,
    formatTime,
    formatListLabel,
    formatChatStamp,
    formatDockDay,
    createWorld
} from "../src/javascripts/film/world.js";

const storyNow = new Date(2026, 9, 14, 23, 47);
const endingNow = new Date(2026, 10, 24, 23, 47);

test("menu bar clock uses two spaces between date and time", () => {
    assert.equal(formatMenuClock(storyNow), "Wed Oct 14  11:47 PM");
});

test("time formats midnight hour as 12 AM", () => {
    assert.equal(formatTime(new Date(2026, 9, 15, 0, 5)), "12:05 AM");
});

test("list labels follow Messages rules relative to story time", () => {
    assert.equal(formatListLabel(new Date(2026, 9, 14, 22, 2), storyNow), "10:02 PM");
    assert.equal(formatListLabel(new Date(2026, 9, 13, 16, 12), storyNow), "Yesterday");
    assert.equal(formatListLabel(new Date(2026, 9, 12, 18, 15), storyNow), "Monday");
    assert.equal(formatListLabel(new Date(2026, 9, 12, 18, 15), endingNow), "10/12/26");
});

test("chat stamps name the day and the time", () => {
    assert.deepEqual(formatChatStamp(new Date(2026, 9, 14, 23, 47), storyNow), { day: "Today", time: "11:47 PM" });
    assert.deepEqual(formatChatStamp(new Date(2026, 9, 13, 16, 12), storyNow), { day: "Yesterday", time: "4:12 PM" });
    assert.deepEqual(formatChatStamp(new Date(2026, 9, 12, 18, 15), endingNow), { day: "10/12/26", time: "6:15 PM" });
});

test("dock calendar shows month and day", () => {
    assert.deepEqual(formatDockDay(new Date(2026, 9, 14)), { month: "OCT", day: "14" });
});

test("world notifies subscribers until they unsubscribe", () => {
    const world = createWorld({ time: storyNow, battery: 23, appearance: "dark" });
    const seen = [];
    const unsubscribe = world.subscribe(state => seen.push(state.battery));
    world.set({ battery: 22 });
    unsubscribe();
    world.set({ battery: 21 });
    assert.deepEqual(seen, [22]);
    assert.equal(world.get().battery, 21);
    assert.equal(world.get().appearance, "dark");
});
