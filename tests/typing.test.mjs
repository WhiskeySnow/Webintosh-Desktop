import test from "node:test";
import assert from "node:assert/strict";
import { planTyping, applyTyping } from "../src/javascripts/film/typing.js";

const gaps = plan => plan.slice(1).map((event, i) => event.t - plan[i].t);
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

test("machine typing is one character every 45ms", () => {
    assert.deepEqual(planTyping(["abc"], { mode: "machine" }).map(e => e.t), [45, 90, 135]);
});

test("human typing is scaled to finish exactly with the voice", () => {
    const plan = planTyping(["what is it?"], { mode: "human", durationMs: 1000 });
    assert.equal(plan.at(-1).t, 1000);
    for (const gap of gaps(plan)) assert.ok(gap > 0);
});

test("a comma makes her pause before the next character", () => {
    const plan = planTyping(["hi, you"], { mode: "human" });
    const all = gaps(plan);
    const afterComma = all[plan.findIndex(e => e.char === ",")];
    assert.ok(afterComma > median(all) * 2, `gap after comma ${afterComma}`);
});

test("deletions and pauses replay to the expected text", () => {
    const plan = planTyping([{ del: 6 }, { pause: 900 }, "I just"], { mode: "human" });
    assert.equal(applyTyping("I just", plan), "I just");
    assert.ok(gaps(plan).some(gap => gap >= 900));
});
