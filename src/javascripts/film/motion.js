// Cursor paths. Her cursor curves, overshoots and trembles; VOLI's cursor
// travels in a perfectly straight line at constant speed.

const FRAME_MS = 16;
const OVERSHOOT_AT = 0.88;

export function makeRng(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function humanDuration(from, to, rng) {
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    return (250 + 120 * Math.log2(dist / 20 + 1)) * (0.9 + 0.2 * rng());
}

const minimumJerk = s => s * s * s * (10 - 15 * s + 6 * s * s);

function bezier(p0, p1, p2, p3, s) {
    const u = 1 - s;
    return {
        x: u * u * u * p0.x + 3 * u * u * s * p1.x + 3 * u * s * s * p2.x + s * s * s * p3.x,
        y: u * u * u * p0.y + 3 * u * u * s * p1.y + 3 * u * s * s * p2.y + s * s * s * p3.y
    };
}

function frameTimes(durationMs) {
    const times = [];
    for (let t = 0; t < durationMs; t += FRAME_MS) times.push(t);
    times.push(durationMs);
    return times;
}

export function planHumanPath(from, to, { durationMs, seed }) {
    const rng = makeRng(seed);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy) || 1;
    const along = { x: dx / dist, y: dy / dist };
    const across = { x: -along.y, y: along.x };

    const side = rng() < 0.5 ? -1 : 1;
    const bend1 = side * (0.08 + 0.07 * rng()) * dist;
    const bend2 = side * (0.08 + 0.07 * rng()) * dist * 0.6;
    const c1 = { x: from.x + along.x * dist * 0.3 + across.x * bend1, y: from.y + along.y * dist * 0.3 + across.y * bend1 };
    const c2 = { x: from.x + along.x * dist * 0.7 + across.x * bend2, y: from.y + along.y * dist * 0.7 + across.y * bend2 };
    const overshoot = 2 + 4 * rng();
    const past = { x: to.x + along.x * overshoot, y: to.y + along.y * overshoot };

    const phase1 = rng() * Math.PI * 2;
    const phase2 = rng() * Math.PI * 2;
    const tremble = s => 0.6 * Math.sin(Math.PI * s) * (0.6 * Math.sin(phase1 + s * 9) + 0.4 * Math.sin(phase2 + s * 23));

    return frameTimes(durationMs).map(t => {
        const s = t / durationMs;
        let point;
        if (s <= OVERSHOOT_AT) {
            point = bezier(from, c1, c2, past, minimumJerk(s / OVERSHOOT_AT));
        } else {
            const settle = minimumJerk((s - OVERSHOOT_AT) / (1 - OVERSHOOT_AT));
            point = { x: past.x + (to.x - past.x) * settle, y: past.y + (to.y - past.y) * settle };
        }
        if (t === durationMs) {
            return { t, x: to.x, y: to.y };
        }
        const wobble = tremble(s);
        return { t, x: point.x + across.x * wobble, y: point.y + across.y * wobble };
    });
}

export function planMachinePath(from, to, { pxPerMs = 1.2 } = {}) {
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const durationMs = dist / pxPerMs;
    return frameTimes(durationMs).map(t => {
        if (t === durationMs) {
            return { t, x: to.x, y: to.y };
        }
        const s = durationMs === 0 ? 1 : t / durationMs;
        return { t, x: from.x + (to.x - from.x) * s, y: from.y + (to.y - from.y) * s };
    });
}

export function samplePath(path, t) {
    if (t <= path[0].t) return { x: path[0].x, y: path[0].y };
    const last = path.at(-1);
    if (t >= last.t) return { x: last.x, y: last.y };
    let i = 1;
    while (path[i].t < t) i++;
    const a = path[i - 1];
    const b = path[i];
    const s = (t - a.t) / (b.t - a.t);
    return { x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s };
}
