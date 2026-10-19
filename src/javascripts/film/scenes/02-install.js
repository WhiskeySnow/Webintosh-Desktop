// 2 · Install. voli.app → VOLI.dmg → Applications → Gatekeeper. She clicks
// Open without hesitating.

import { establish } from "./establish.js";
import { scenes } from "./index.js";

function installed({ ui }) {
    const { shell, voli, windows } = ui;
    shell.dock.add("VOLI", "assets/film/icons/voli.svg");
    shell.dock.setRunning("VOLI", true);
    voli.open();
    voli.show("welcome");
    windows.focus("voli");
}

export default {
    id: "02-install",
    setup: ctx => establish(ctx, 2, scenes),
    async run(ctx) {
        const { at, beat, cursor, ui } = ctx;
        const { messages, safari, finder, system, shell, windows } = ui;

        await at(500);
        beat("click-link");
        await cursor.moveTo(messages.el.querySelector(".link-card"), { mode: "human" });
        await cursor.click({ mode: "human" });
        safari.openVoliSite();
        windows.focus("safari");

        await at(2000);
        beat("site");
        await cursor.idle(1500);

        await at(4000);
        beat("download");
        await cursor.moveTo(safari.downloadButton, { mode: "human" });
        await cursor.click({ mode: "human" });
        await safari.download("VOLI.dmg", 2500);

        await at(7500);
        beat("open-dmg");
        await cursor.moveTo(safari.downloadItem, { mode: "human" });
        await cursor.click({ mode: "human", count: 2 });
        safari.hideDownloads();
        finder.openDmg();

        await at(9000);
        beat("drag");
        await cursor.drag(finder.item("VOLI"), finder.item("Applications"), { mode: "human" });
        await finder.copy(900);

        await at(12000);
        beat("launch");
        finder.openApplications();
        await cursor.moveTo(finder.item("VOLI"), { mode: "human" });
        await cursor.click({ mode: "human", count: 2 });

        await at(13500);
        beat("gatekeeper");
        const gate = system.gatekeeper({ app: "VOLI", browser: "Safari", time: "11:49 PM", host: "voli.app" });
        await cursor.moveTo(gate.button("Open"), { mode: "human" });
        await cursor.click({ mode: "human" });
        gate.close();

        await at(15500);
        beat("dock-bounce");
        shell.dock.add("VOLI", "assets/film/icons/voli.svg");
        shell.dock.setRunning("VOLI", true);
        await shell.dock.bounce("VOLI", 1500);

        await at(17500);
        beat("welcome");
        installed(ctx);
    },
    apply(ctx) {
        const { safari, finder } = ctx.ui;
        safari.openVoliSite();
        safari.markDownloaded("VOLI.dmg");
        finder.openDmg();
        finder.hasVoli = true;
        finder.openApplications();
        installed(ctx);
    }
};
