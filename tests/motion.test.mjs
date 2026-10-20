import test from "node:test";
import assert from "node:assert/strict";
import { makeRng, humanDuration, planHumanPath, planMachinePath, samplePath } from "../src/javascripts/film/motion.js";

const origin = { x: 0, y: 0 };
const right = { x: 400, y: 0 };

test("human paths are deterministic per seed", () => {
    const a = planHumanPath(origin, right, { durationMs: 600, seed: 7 });
    const b = planHumanPath(origin, right, { durationMs: 600, seed: 7 });
    const c = planHumanPath(origin, right, { durationMs: 600, seed: 8 });
    assert.deepEqual(a, b);
    assert.notDeepEqual(a, c);
});

test("human path overshoots slightly, curves, and lands exactly", () => {
    const path = planHumanPath(origin, right, { durationMs: 600, seed: 3 });
    const last = path.at(-1);
    assert.deepEqual({ x: last.x, y: last.y }, right);
    assert.equal(last.t, 600);
    const maxX = Math.max(...path.map(p => p.x));
    assert.ok(maxX >= 402 && maxX <= 406, `overshoot to ${maxX}`);
    const maxY = Math.max(...path.map(p => Math.abs(p.y)));
    assert.ok(maxY > 3, `path too straight: ${maxY}`);
});

test("machine path is straight, constant speed and exact", () => {
    const to = { x: 300, y: 400 };
    const path = planMachinePath(origin, to, { pxPerMs: 1.2 });
    const last = path.at(-1);
    assert.deepEqual({ x: last.x, y: last.y }, to);
    assert.ok(Math.abs(last.t - 500 / 1.2) < 1e-9);
    for (const p of path) {
        const offLine = Math.abs(p.x * 400 - p.y * 300) / 500;
        assert.ok(offLine < 1e-9, `point off the line by ${offLine}`);
    }
    const steps = path.slice(1).map((p, i) => Math.hypot(p.x - path[i].x, p.y - path[i].y));
    for (const step of steps.slice(0, -1)) {
        assert.ok(Math.abs(step - steps[0]) < 1e-6);
    }
});

test("sampling past the end returns the endpoint", () => {
    const path = planMachinePath(origin, right, {});
    assert.deepEqual(samplePath(path, path.at(-1).t + 100), right);
});

test("human duration grows with distance and stays seeded", () => {
    const near = humanDuration(origin, { x: 40, y: 0 }, makeRng(1));
    const far = humanDuration(origin, { x: 800, y: 0 }, makeRng(1));
    assert.ok(far > near);
    assert.equal(humanDuration(origin, right, makeRng(5)), humanDuration(origin, right, makeRng(5)));
});
