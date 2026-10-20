// The on-screen cursor. In "human" mode it moves like her hand and clicks
// audibly; in "machine" mode it is VOLI: straight, even and silent.

import { humanDuration, makeRng, planHumanPath, planMachinePath, samplePath } from "./motion.js";

const ARROW = `<svg class="film-cursor-arrow" width="20" height="28" viewBox="0 0 20 28"><path d="M2 2v20.5l5.2-5 3.4 7.8 3.4-1.5-3.3-7.6h7.1Z" fill="#000" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
const IBEAM = `<svg class="film-cursor-ibeam" width="11" height="22" viewBox="0 0 11 22"><path d="M1 1.2c2.3 0 3.5.7 4.5 1.8 1-1.1 2.2-1.8 4.5-1.8M1 20.8c2.3 0 3.5-.7 4.5-1.8 1 1.1 2.2 1.8 4.5 1.8M5.5 3v16" fill="none" stroke="#fff" stroke-width="3"/><path d="M1 1.2c2.3 0 3.5.7 4.5 1.8 1-1.1 2.2-1.8 4.5-1.8M1 20.8c2.3 0 3.5-.7 4.5-1.8 1 1.1 2.2 1.8 4.5 1.8M5.5 3v16" fill="none" stroke="#000" stroke-width="1.2"/></svg>`;

export function stagePoint(stage, el, offset = { x: 0, y: 0 }) {
    const scale = Number(stage.dataset.scale) || 1;
    const s = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
        x: (r.left - s.left + r.width / 2) / scale + offset.x,
        y: (r.top - s.top + r.height / 2) / scale + offset.y
    };
}

// The time at which the path has covered `fraction` of the straight-line way to `to`.
function timeAtDistance(path, from, to, fraction) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length2 = dx * dx + dy * dy || 1;
    const hit = path.find(p => ((p.x - from.x) * dx + (p.y - from.y) * dy) / length2 >= fraction);
    return hit ? hit.t : path.at(-1).t;
}

export function createCursor(stage, { timeline, sound, seed = 1, start = { x: 960, y: 540 } }) {
    const el = document.createElement("div");
    el.className = "film-cursor";
    el.innerHTML = ARROW + IBEAM;
    stage.appendChild(el);

    let rng = makeRng(seed);
    const pos = { ...start };
    let under = null;
    let hovered = null;
    let lastMove = 0;
    let longestStill = 0;
    let stillAnchor = { ...start };

    function viewportPoint() {
        const scale = Number(stage.dataset.scale) || 1;
        const s = stage.getBoundingClientRect();
        return { x: s.left + pos.x * scale, y: s.top + pos.y * scale };
    }

    function elementUnder() {
        const p = viewportPoint();
        return document.elementFromPoint(p.x, p.y);
    }

    function place(point) {
        if (Math.hypot(point.x - stillAnchor.x, point.y - stillAnchor.y) > 0.5) {
            longestStill = Math.max(longestStill, timeline.t - lastMove);
            lastMove = timeline.t;
            stillAnchor = { ...point };
        }
        pos.x = point.x;
        pos.y = point.y;
        el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        const now = elementUnder();
        if (now !== under) {
            under?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: false }));
            now?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
            under = now;
        }
        const hover = now?.closest?.("[data-hoverable]") ?? null;
        if (hover !== hovered) {
            hovered?.classList.remove("is-hover");
            hover?.classList.add("is-hover");
            hovered = hover;
        }
        el.dataset.shape = now?.closest?.("[data-text]") ? "ibeam" : "arrow";
    }

    function resolve(target, offset) {
        if (typeof target === "string") target = stage.querySelector(target);
        if (target instanceof Element) return stagePoint(stage, target, offset);
        return { x: target.x + (offset?.x ?? 0), y: target.y + (offset?.y ?? 0) };
    }

    function dispatch(type, extra = {}) {
        const target = elementUnder();
        const p = viewportPoint();
        target?.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: p.x, clientY: p.y, ...extra }));
        return target;
    }

    place(pos);

    const cursor = {
        el,
        pos,
        async moveTo(target, { mode = "human", durationMs, until = 1, offset, pxPerMs } = {}) {
            const from = { ...pos };
            const to = resolve(target, offset);
            const path = mode === "machine"
                ? planMachinePath(from, to, { pxPerMs })
                : planHumanPath(from, to, { durationMs: durationMs ?? humanDuration(from, to, rng), seed: Math.floor(rng() * 1e9) });
            const total = until >= 1 ? path.at(-1).t : timeAtDistance(path, from, to, until);
            await timeline.animate(total, p => place(samplePath(path, p * total)));
        },
        async click({ mode = "human", count = 1 } = {}) {
            for (let i = 1; i <= count; i++) {
                dispatch("mousedown", { detail: i });
                dispatch("mouseup", { detail: i });
                dispatch("click", { detail: i });
                if (mode === "human") sound.play("click");
                await timeline.wait(mode === "human" ? 90 : 40);
            }
            if (count === 2) dispatch("dblclick", { detail: 2 });
        },
        async drag(fromEl, to, { mode = "human" } = {}) {
            const source = typeof fromEl === "string" ? stage.querySelector(fromEl) : fromEl;
            await cursor.moveTo(source, { mode });
            dispatch("mousedown");
            const scale = Number(stage.dataset.scale) || 1;
            const rect = source.getBoundingClientRect();
            const width = rect.width / scale;
            const height = rect.height / scale;
            const ghost = source.cloneNode(true);
            ghost.classList.add("film-drag-ghost");
            ghost.style.width = `${width}px`;
            ghost.style.height = `${height}px`;
            stage.appendChild(ghost);
            const follow = () => {
                ghost.style.transform = `translate(${pos.x - width / 2}px, ${pos.y - height / 2}px)`;
            };
            follow();
            const toPoint = resolve(to);
            const from = { ...pos };
            const path = mode === "machine" ? planMachinePath(from, toPoint)
                : planHumanPath(from, toPoint, { durationMs: humanDuration(from, toPoint, rng) * 1.3, seed: Math.floor(rng() * 1e9) });
            await timeline.animate(path.at(-1).t, p => {
                place(samplePath(path, p * path.at(-1).t));
                follow();
            });
            ghost.remove();
            elementUnder()?.dispatchEvent(new CustomEvent("film-drop", { bubbles: true, detail: { source } }));
            dispatch("mouseup");
        },
        reseed(next) {
            rng = makeRng(next);
        },
        resetStill() {
            lastMove = timeline.t;
            longestStill = 0;
            stillAnchor = { ...pos };
        },
        // Longest stretch (ms) the cursor has not moved since resetStill().
        longestStill: () => Math.max(longestStill, timeline.t - lastMove),
        jump(target, offset) {
            place(resolve(target, offset));
        },
        hover: ms => timeline.wait(ms),
        // A resting hand: a slow drift of a few pixels per second that eases in
        // and out, ending exactly where it began.
        async idle(ms) {
            const base = { ...pos };
            const phase = rng() * Math.PI * 2;
            const ramp = Math.min(300, ms / 2);
            await timeline.animate(ms, p => {
                const t = p * ms;
                const envelope = Math.min(1, t / ramp, (ms - t) / ramp);
                place({
                    x: base.x + envelope * (2.5 * Math.sin(phase + t / 650) + 1.2 * Math.sin(phase * 2.3 + t / 290)),
                    y: base.y + envelope * (1.6 * Math.sin(phase * 1.7 + t / 820) + 0.8 * Math.sin(phase * 3.1 + t / 370))
                });
            });
        }
    };
    return cursor;
}
