import test from "node:test";
import assert from "node:assert/strict";
import { sliceKeys } from "../tools/slice-keys.mjs";

const RATE = 44100;

test("the eight strongest keystrokes become 120ms samples", () => {
    const samples = new Float32Array(RATE * 3);
    const strokes = [0.2, 0.45, 0.7, 0.95, 1.2, 1.45, 1.7, 1.95, 2.2, 2.45];
    const loud = new Set([0.2, 0.45, 0.95, 1.2, 1.7, 1.95, 2.2, 2.45]);
    for (const at of strokes) {
        const start = Math.round(at * RATE);
        const level = loud.has(at) ? 0.9 : 0.2;
        for (let i = 0; i < 400; i++) samples[start + i] = level * Math.exp(-i / 80) * (i % 2 ? 1 : -1);
    }
    const slices = sliceKeys(samples, RATE);
    assert.equal(slices.length, 8);
    for (const slice of slices) assert.equal(slice.samples.length, Math.round(0.12 * RATE));
    const found = slices.map(slice => Math.round(slice.at * 100) / 100).sort((a, b) => a - b);
    assert.deepEqual(found, [...loud].sort((a, b) => a - b));
});
