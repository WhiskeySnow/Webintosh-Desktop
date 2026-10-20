// Typing schedules. Her typing breathes around spaces and punctuation and is
// stretched to last exactly as long as her voice line; VOLI types at a flat 45ms.

import { makeRng } from "./motion.js";

const MACHINE_MS = 45;
const HUMAN_BASE_MS = 110;

function expand(ops) {
    const steps = [];
    for (const op of ops) {
        if (typeof op === "string") {
            for (const char of op) steps.push({ op: "insert", char });
        } else if (op.del) {
            for (let i = 0; i < op.del; i++) steps.push({ op: "delete" });
        } else if (op.pause) {
            steps.push({ pause: op.pause });
        }
    }
    return steps;
}

export function planTyping(ops, { mode, durationMs, seed = 1 }) {
    const steps = expand(ops);

    if (mode === "machine") {
        return steps.filter(step => !step.pause).map((step, i) => ({ ...step, t: (i + 1) * MACHINE_MS }));
    }

    const rng = makeRng(seed);
    const events = [];
    let pending = 0;
    let previous = null;
    for (const step of steps) {
        if (step.pause) {
            pending += step.pause;
            continue;
        }
        let weight = step.op === "delete" ? 0.6 : 1;
        if (step.char === " ") weight *= 1.4;
        if (previous && /[,.?!]/.test(previous)) weight *= 3;
        weight *= 0.65 + 0.7 * rng();
        events.push({ ...step, weight, pause: pending });
        pending = 0;
        previous = step.char ?? previous;
    }

    const typingWeight = events.reduce((sum, e) => sum + e.weight, 0);
    const pauseTotal = events.reduce((sum, e) => sum + e.pause, 0);
    const unit = durationMs ? Math.max(1, durationMs - pauseTotal) / typingWeight : HUMAN_BASE_MS;

    let t = 0;
    return events.map(({ weight, pause, ...step }, i) => {
        t += pause + weight * unit;
        return { ...step, t: durationMs && i === events.length - 1 ? durationMs : t };
    });
}

export function applyTyping(initial, plan) {
    let text = initial;
    for (const event of plan) {
        text = event.op === "insert" ? text + event.char : text.slice(0, -1);
    }
    return text;
}
