// 4 · Observation. VOLI shows what it measured, then something it should
// not know: what she did before it was installed. Silence follows.

import { establish } from "./establish.js";
import { scenes } from "./index.js";

const LINE = "You deleted “I just” twice before Mia texted you.";

export default {
    id: "04-observation",
    setup: ctx => establish(ctx, 4, scenes),
    async run({ at, beat, cursor, ui }) {
        const { voli } = ui;
        beat("observation");
        voli.show("observation");
        await cursor.idle(3800);
        await at(4000);
        beat("line");
        voli.appendLine(LINE);
        await at(4600);
        beat("silence");
        await cursor.idle(4000);
        await cursor.idle(4000);
    },
    apply({ ui }) {
        ui.voli.show("observation");
        ui.voli.appendLine(LINE);
    }
};
