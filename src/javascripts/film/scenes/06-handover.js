// 6 · Handover. "Do you feel in control?" Her cursor heads for No; seventy
// percent of the way there it becomes VOLI's and clicks Yes, silently.

import { establish } from "./establish.js";
import { scenes } from "./index.js";

export default {
    id: "06-handover",
    setup: ctx => establish(ctx, 6, scenes),
    async run({ at, beat, cursor, ui, wait }) {
        const { voli, windows } = ui;
        beat("control");
        windows.focus("voli");
        voli.show("control");
        await cursor.idle(2300);

        await at(2500);
        beat("reach-no");
        await cursor.moveTo(voli.button("No"), { mode: "human", until: 0.7 });
        beat("takeover");
        await cursor.moveTo(voli.button("Yes"), { mode: "machine" });
        await cursor.click({ mode: "machine" });
        beat("thanks");
        voli.show("thanks");
        await wait(600);
        beat("roomtone-out");
    },
    apply({ ui }) {
        ui.windows.focus("voli");
        ui.voli.show("thanks");
    }
};
