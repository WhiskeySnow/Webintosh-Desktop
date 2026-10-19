// 3 · Questions. Quick answers, then 2.3 seconds on "Stay comfortable" before
// she picks "Know the truth". She says she usually finishes what she starts.

import { establish } from "./establish.js";
import { scenes } from "./index.js";
import { HOVER } from "../data/story.js";

const QUESTIONS = [
    { prompt: "Coffee or tea?", options: ["Coffee", "Tea"] },
    { prompt: "Text or call?", options: ["Text", "Call"] },
    { prompt: "Plan ahead, or figure it out as you go?", options: ["Plan ahead", "Figure it out"] },
    { prompt: "Would you rather know the truth, or stay comfortable?", options: ["Know the truth", "Stay comfortable"] },
    { prompt: "Do you usually finish what you start?", options: ["Usually", "Not always"] }
];

export default {
    id: "03-questions",
    setup: ctx => establish(ctx, 3, scenes),
    async run(ctx) {
        const { at, beat, cursor, ui, world } = ctx;
        const { voli } = ui;
        const ask = n => voli.show("question", { index: n + 1, ...QUESTIONS[n] });
        const choose = async (label, durationMs) => {
            await cursor.moveTo(voli.option(label), { mode: "human", durationMs });
            await cursor.click({ mode: "human" });
        };

        await cursor.idle(1800);
        await at(2500);
        beat("get-started");
        await cursor.moveTo(voli.button("Get Started"), { mode: "human" });
        await cursor.click({ mode: "human" });

        await at(4000);
        beat("q1");
        ask(0);
        await cursor.idle(700);
        await choose("Coffee", 520);

        await at(7000);
        beat("q2");
        ask(1);
        await cursor.idle(600);
        await choose("Text", 480);

        await at(10000);
        beat("q3");
        ask(2);
        await cursor.idle(900);
        await cursor.moveTo(voli.option("Plan ahead"), { mode: "human" });
        await cursor.hover(600);
        await choose("Figure it out");

        await at(15000);
        beat("q4");
        ask(3);
        await cursor.idle(1600);
        await cursor.moveTo(voli.option("Stay comfortable"), { mode: "human" });
        beat("q4-hover");
        await cursor.hover(HOVER.stay * 1000);
        beat("q4-choose");
        await cursor.moveTo(voli.option("Know the truth"), { mode: "human" });
        await cursor.hover(HOVER.truth * 1000);
        await cursor.click({ mode: "human" });

        await at(30000);
        beat("q5");
        ask(4);
        world.set({ time: new Date(2026, 9, 14, 23, 51) });
        await cursor.idle(800);
        await choose("Usually", 560);
        await at(32000);
        beat("learning");
        voli.show("learning");
        await cursor.idle(6000);
    },
    apply({ ui }) {
        ui.voli.show("learning");
    }
};
