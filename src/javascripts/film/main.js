// Film entry point. URL parameters:
//   scene=N  play only scene N      dev=name  play a test scene
//   debug=1  timecode overlay       rate=R    speed up time
//   pause=ms freeze at that time (for screenshots)

import { Timeline } from "./clock.js";
import { createWorld } from "./world.js";
import { mountStage } from "./stage.js";
import { createDirector } from "./director.js";
import { createSound } from "./sound.js";
import { createCursor } from "./cursor.js";
import { createKeyboard } from "./keyboard.js";
import { createShell } from "./ui/shell.js";
import { createNotifications } from "./ui/notifications.js";
import { createWindows } from "./ui/windows.js";
import { createSafari } from "./ui/safari.js";
import { createFinder } from "./ui/finder.js";
import { createStickies } from "./ui/stickies.js";
import { createMessages } from "./ui/messages.js";
import { createVoli } from "./ui/voli.js";
import { createSystem } from "./ui/system.js";
import { manifest } from "./data/manifest.js";
import { SCENES, TIMELINE } from "./data/story.js";
import { scenes } from "./scenes/index.js";
import { devScenes } from "./scenes/dev.js";

const params = new URLSearchParams(location.search);
const film = window.__film = { log: [], audioLog: [], overruns: [], errors: [], done: false, frozen: false };
addEventListener("error", event => film.errors.push(String(event.message)));
addEventListener("unhandledrejection", event => film.errors.push(String(event.reason?.message ?? event.reason)));

const stage = mountStage(document.body);
const timeline = new Timeline({ rate: Number(params.get("rate") ?? 1) });
const world = createWorld(TIMELINE[0]);
const audio = new AudioContext();
const sound = film.sound = createSound({ audio, timeline, film });

function overlay(text, className) {
    const el = document.createElement("div");
    el.className = `film-overlay ${className}`;
    el.textContent = text;
    document.body.appendChild(el);
    return el;
}

function startDebugOverlay(director) {
    const el = overlay("", "film-debug");
    const format = ms => {
        const total = Math.max(0, ms);
        const minutes = String(Math.floor(total / 60000)).padStart(2, "0");
        const seconds = String(Math.floor(total / 1000) % 60).padStart(2, "0");
        return `${minutes}:${seconds}.${String(Math.floor(total) % 1000).padStart(3, "0")}`;
    };
    const tick = () => {
        const { scene, beat } = director.current();
        el.textContent = `${format(timeline.t)}  ${scene ?? ""} · ${beat ?? ""}`;
        requestAnimationFrame(tick);
    };
    tick();
}

function watchPause(pauseMs) {
    timeline.freezeAt(pauseMs);
    const check = () => {
        film.frozen = timeline.t >= pauseMs;
        if (!film.frozen) requestAnimationFrame(check);
    };
    check();
}

async function audioAllowed() {
    const delay = new Promise(resolve => setTimeout(() => resolve(false), 500));
    return Promise.race([audio.resume().then(() => true), delay]);
}

async function boot() {
    const sceneParam = params.get("scene");
    if (sceneParam !== null && !(/^\d+$/.test(sceneParam) && Number(sceneParam) < SCENES.length)) {
        film.errors.push(`unknown scene ${sceneParam}`);
        overlay(`Unknown scene "${sceneParam}". Valid: 0–${SCENES.length - 1}`, "film-message");
        return;
    }

    if (!(await audioAllowed())) {
        const gate = overlay("Click to start", "film-message film-gate");
        await new Promise(resolve => addEventListener("pointerdown", resolve, { once: true }));
        await audio.resume();
        gate.remove();
    }

    await sound.load(manifest);
    const shell = createShell(stage.el, { world, timeline });
    const windows = createWindows(stage.el, { shell });
    const ui = {
        shell,
        windows,
        notifications: createNotifications(stage.el, { sound }),
        finder: createFinder(windows, { timeline }),
        safari: createSafari(windows, { timeline }),
        stickies: createStickies(windows),
        messages: createMessages(windows, { world, sound }),
        voli: createVoli(windows),
        system: createSystem(windows, { sound })
    };
    const cursor = createCursor(stage.el, { timeline, sound });
    const keyboard = createKeyboard({ timeline, sound });

    const director = createDirector({
        timeline,
        film,
        makeCtx: () => ({ timeline, world, stage: stage.el, audio, sound, cursor, keyboard, ui, film })
    });
    if (params.get("debug") === "1") startDebugOverlay(director);
    if (params.has("pause")) watchPause(Number(params.get("pause")));

    timeline.start();
    try {
        await director.run({
            scenes,
            devScenes,
            scene: sceneParam === null ? null : Number(sceneParam),
            dev: params.get("dev")
        });
    } catch (error) {
        film.errors.push(String(error.message ?? error));
        overlay(String(error.message ?? error), "film-message");
    }
}

boot();
