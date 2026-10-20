// 8 · Mia again. She starts typing "yeah delete—"; her words are erased and
// replaced with "no keep it", which goes out without a sound.

import { establish } from "./establish.js";
import { scenes } from "./index.js";

function miaAsks({ ui }, { silent, animate = true }) {
    const { messages, notifications, shell } = ui;
    messages.bubble("mia", { from: "them", text: "did it get you right??", silent: true });
    notifications.show({ app: "Messages", icon: "icons/messages.png", title: "Mia Chen", body: "did it get you right??", silent, animate });
    shell.dock.setBadge("Messages", 1);
}

function openMia({ ui }) {
    ui.notifications.clear();
    ui.messages.open("mia");
    ui.windows.focus("messages");
    ui.shell.dock.setBadge("Messages", null);
}

export default {
    id: "08-mia-again",
    setup: ctx => establish(ctx, 8, scenes),
    async run(ctx) {
        const { at, beat, cursor, keyboard, sound, ui, wait } = ctx;
        const { messages, notifications } = ui;

        beat("mia-notify");
        miaAsks(ctx, { silent: false });
        sound.play("M6");

        await at(1500);
        beat("open");
        await cursor.moveTo(document.querySelector(".nb"), { mode: "human" });
        await cursor.click({ mode: "human" });
        openMia(ctx);

        await at(3000);
        beat("type-kinda");
        await keyboard.type(messages.input, ["kinda this is weird"], { mode: "human", voice: "P4", seed: 21 });
        messages.send();

        await at(7000);
        beat("wait");
        messages.typing(true);
        await wait(1000);
        messages.bubble("mia", { from: "them", text: "wait" });
        sound.play("M7");

        await at(8800);
        beat("delete-q");
        messages.typing(true);
        await wait(1000);
        messages.bubble("mia", { from: "them", text: "should i delete it lol" });
        sound.play("M8");

        await at(11500);
        beat("yeah-delete");
        await keyboard.type(messages.input, ["yeah dele"], { mode: "human", voice: "P5", cutAt: 0.62, seed: 22 });

        await at(13800);
        beat("erase");
        await keyboard.type(messages.input, [{ del: 9 }], { mode: "machine" });
        await wait(300);
        await keyboard.type(messages.input, ["no keep it"], { mode: "machine" });
        await wait(250);
        messages.send({ silent: true });

        await at(17000);
        beat("same-thing");
        notifications.show({ app: "VOLI", icon: "icons/voli.svg", title: "VOLI", body: "You would have said the same thing.", silent: true });
    },
    apply(ctx) {
        const { messages } = ctx.ui;
        miaAsks(ctx, { silent: true, animate: false });
        ctx.cursor.jump(document.querySelector(".nb"));
        openMia(ctx);
        messages.input.textContent = "kinda this is weird";
        messages.send({ silent: true });
        messages.bubble("mia", { from: "them", text: "wait", silent: true });
        messages.bubble("mia", { from: "them", text: "should i delete it lol", silent: true });
        messages.input.textContent = "no keep it";
        messages.send({ silent: true });
    }
};
