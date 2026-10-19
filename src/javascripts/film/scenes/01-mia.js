// 1 · Mia. She opens the conversation, asks what it is, and gets the link.

import { establish } from "./establish.js";
import { scenes } from "./index.js";

const at = (h, m) => new Date(2026, 9, 14, h, m);

function openConversation({ ui }) {
    const { notifications, messages, windows, shell } = ui;
    notifications.clear();
    messages.open("mia");
    windows.focus("messages");
    shell.dock.setBadge("Messages", null);
}

export default {
    id: "01-mia",
    setup: ctx => establish(ctx, 1, scenes),
    async run(ctx) {
        const { at: anchor, beat, cursor, keyboard, sound, world, ui, wait } = ctx;
        const { messages } = ui;
        await anchor(800);
        beat("click-notif");
        const banner = document.querySelector(".nb");
        await cursor.moveTo(banner, { mode: "human" });
        await cursor.click({ mode: "human" });
        openConversation(ctx);
        await cursor.idle(500);

        await anchor(2500);
        beat("type-what");
        await keyboard.type(messages.input, ["what is it?"], { mode: "human", voice: "P2", seed: 11 });
        messages.send();

        await anchor(5200);
        beat("read-1");
        messages.receipt("Read 11:47 PM");

        await anchor(6000);
        beat("mia-typing");
        const miaSays = async (typingMs, text, voice) => {
            messages.typing(true);
            await wait(typingMs);
            messages.bubble("mia", { from: "them", text });
            sound.play(voice);
            await wait(sound.duration(voice));
        };
        await miaSays(1500, "this weird app i found", "M2");
        await miaSays(1200, "it asks you random stuff and then guesses what you’re gonna pick", "M3");
        await miaSays(1000, "it’s lowkey way too accurate 😭", "M4");
        world.set({ time: at(23, 48) });

        await anchor(17000);
        beat("type-send");
        await keyboard.type(messages.input, ["send it lol"], { mode: "human", voice: "P3", seed: 12 });
        messages.send();

        await anchor(19500);
        beat("read-2");
        messages.receipt("Read 11:48 PM");

        await anchor(21000);
        beat("link");
        messages.typing(true);
        await wait(1200);
        messages.link("mia", { from: "them" });

        await anchor(24000);
        beat("tell-me");
        messages.typing(true);
        await wait(900);
        messages.bubble("mia", { from: "them", text: "tell me if it gets you right lol" });
        sound.play("M5");
    },
    apply(ctx) {
        const { messages } = ctx.ui;
        openConversation(ctx);
        const say = (from, text) => messages.bubble("mia", { from, text, silent: true });
        messages.input.value = "what is it?";
        messages.send({ silent: true });
        say("them", "this weird app i found");
        say("them", "it asks you random stuff and then guesses what you’re gonna pick");
        say("them", "it’s lowkey way too accurate 😭");
        ctx.world.set({ time: at(23, 48) });
        messages.input.value = "send it lol";
        messages.send({ silent: true });
        messages.receipt("Read 11:48 PM");
        messages.link("mia", { from: "them", silent: true });
        say("them", "tell me if it gets you right lol");
    }
};
