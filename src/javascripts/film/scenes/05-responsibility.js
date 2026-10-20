// 5 · Responsibility. "If it's wrong, it's on me." She turns Autopilot on,
// opens System Settings, and the switch flips before she touches it.

import { establish } from "./establish.js";
import { scenes } from "./index.js";

const APPS = [
    { name: "Raycast", icon: "icons/raycast.png", on: true },
    { name: "zoom.us", icon: "icons/zoom.png", on: true },
    { name: "VOLI", icon: "icons/voli.svg", on: false }
];

export default {
    id: "05-responsibility",
    setup: ctx => establish(ctx, 5, scenes),
    async run({ at, beat, cursor, ui, stage }) {
        const { voli, system, shell } = ui;
        beat("autopilot");
        voli.show("autopilot");
        await cursor.idle(3200);

        await at(4000);
        beat("hesitate");
        // The gap between the two buttons, in stage pixels (the stage is scaled 2× in OBS).
        const scale = Number(stage.dataset.scale) || 1;
        const frame = stage.getBoundingClientRect();
        const notNow = voli.button("Not Now").getBoundingClientRect();
        const turnOn = voli.button("Turn On Autopilot").getBoundingClientRect();
        const between = {
            x: ((notNow.right + turnOn.left) / 2 - frame.left) / scale,
            y: ((turnOn.top + turnOn.bottom) / 2 - frame.top) / scale + 2
        };
        await cursor.moveTo(between, { mode: "human" });
        await cursor.hover(1500);
        beat("turn-on");
        await cursor.moveTo(voli.button("Turn On Autopilot"), { mode: "human" });
        await cursor.click({ mode: "human" });

        await at(7000);
        beat("prompt");
        const prompt = system.accessibilityPrompt("VOLI");
        await cursor.idle(1000);
        await at(8800);
        beat("open-settings");
        await cursor.moveTo(prompt.button("Open System Settings"), { mode: "human" });
        await cursor.click({ mode: "human" });
        prompt.close();

        await at(10000);
        beat("settings");
        system.settings.openAccessibility(APPS);
        await cursor.idle(1500);

        await at(13000);
        beat("stop-short");
        await cursor.moveTo(system.settings.toggle("VOLI"), { mode: "human", offset: { x: -23, y: 0 } });
        await at(14400);
        beat("toggle");
        system.settings.setOn("VOLI", true, { sound: "toggle" });

        await at(16000);
        beat("menu-extra");
        shell.menubar.showExtra("voli", voli.menuExtraSvg);
        await cursor.hover(8000);
    },
    apply({ ui, cursor }) {
        const { voli, system, shell } = ui;
        voli.show("autopilot");
        system.settings.openAccessibility(APPS);
        cursor.jump(system.settings.toggle("VOLI"), { x: -23, y: 0 });
        system.settings.setOn("VOLI", true);
        shell.menubar.showExtra("voli", voli.menuExtraSvg);
    }
};
