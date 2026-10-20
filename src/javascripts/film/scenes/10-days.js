// 10 · Many days. Every morning the same screen; every morning she accepts
// faster. On day 40 she doesn't open it at all. Then the camera pulls back
// into a wall of screens — hers, then other people's.

import { establish } from "./establish.js";
import { scenes } from "./index.js";
import { DAYS } from "../data/story.js";
import { GRID_VARIANTS } from "../data/grid-variants.js";

const ANCHORS = [0, 7500, 13500, 18500];
const BATTERY = [96, 81, 64, 47];
const MOVE_MS = [undefined, 650, 520, 420];

const tiles = kind => GRID_VARIANTS.filter(v => v.kind === kind).map(v => `grid/${v.id}.jpg`);

function morning({ ui, world }, day, battery) {
    world.set({ time: day.date, battery });
    ui.notifications.clear();
    ui.voli.close();
}

export default {
    id: "10-days",
    setup: ctx => establish(ctx, 10, scenes),
    async run(ctx) {
        const { at, beat, cursor, ui, film } = ctx;
        const { shell, notifications, voli, windows, messages, grid } = ui;
        const human = durationMs => ({ mode: "human", durationMs });
        shell.dock.setRunning("Music", true);

        for (const [i, anchor] of ANCHORS.entries()) {
            const day = DAYS[i];
            await at(anchor);
            beat(`day-${day.day}`);
            morning(ctx, day, BATTERY[i]);
            const banner = notifications.show({ app: "VOLI", icon: "icons/voli.svg", title: "VOLI", body: "Today’s choices are ready.", silent: true });
            await cursor.idle(i === 0 ? 900 : 300);
            await cursor.moveTo(banner, human(MOVE_MS[i]));
            await cursor.click({ mode: "human" });
            notifications.dismiss(banner);
            voli.open();
            voli.show("daily", { day });
            windows.focus("voli");
            await cursor.moveTo(voli.button("Accept All"), human(MOVE_MS[i]));
            beat(`hover-${day.day}`);
            await cursor.hover(day.acceptedIn * 1000);
            beat(`accept-${day.day}`);
            await cursor.click({ mode: "human" });
            if (day.day === 23) messages.mute("mia");
        }

        await at(22500);
        const last = DAYS[4];
        beat(`day-${last.day}`);
        morning(ctx, last, 33);
        notifications.show({ app: "VOLI", icon: "icons/voli.svg", title: "VOLI", body: last.note, silent: true });
        grid.build({ near: tiles("her"), far: tiles("other") });

        await at(25000);
        beat("grid");
        await grid.zoomOut(8000);
        film.results = { centerWidth: grid.centerWidth(), farDistinct: grid.farDistinct() };

        await at(33000);
        beat("music-stop");
    },
    apply({ ui, cursor }) {
        const { shell, messages, notifications, voli, windows } = ui;
        shell.dock.setRunning("Music", true);
        messages.mute("mia");
        voli.open();
        voli.show("daily", { day: DAYS[3] });
        windows.focus("voli");
        cursor.jump(voli.button("Accept All"));
        voli.close();
        notifications.clear();
    }
};
