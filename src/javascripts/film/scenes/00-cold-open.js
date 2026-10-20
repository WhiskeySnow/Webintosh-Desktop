// 0 · Cold open. 11:47 PM. She deletes and retypes "I just" twice, lingers on
// a file she won't open, and Mia's message arrives.

import { establish } from "./establish.js";

const FILE = "pros and cons (3).docx";

function miaArrives({ ui }, { silent, animate = true }) {
    const { messages, notifications, shell } = ui;
    messages.bubble("mia", { from: "them", text: "you need to try this lol", silent: true });
    notifications.show({ app: "Messages", icon: "icons/messages.png", title: "Mia Chen", body: "you need to try this lol", silent, animate });
    shell.dock.setBadge("Messages", 1);
}

export default {
    id: "00-cold-open",
    setup: ctx => establish(ctx, 0, []),
    async run(ctx) {
        const { at, beat, cursor, keyboard, sound, ui } = ctx;
        const { safari, shell, windows } = ui;

        beat("hold");
        await cursor.idle(1400);
        await at(1500);
        beat("delete-1");
        await keyboard.type(safari.docText, [{ del: 6 }], { mode: "human", seed: 3 });
        await at(3400);
        beat("retype-1");
        await keyboard.type(safari.docText, ["I just"], { mode: "human", voice: "P1a", seed: 4 });
        await cursor.idle(1200);
        await at(6500);
        beat("delete-2");
        await keyboard.type(safari.docText, [{ del: 6 }], { mode: "human", seed: 5 });
        await at(8000);
        beat("retype-2");
        await keyboard.type(safari.docText, ["I just"], { mode: "human", voice: "P1b", seed: 6 });
        await cursor.idle(1800);

        await at(12000);
        beat("to-file");
        await cursor.moveTo(shell.desktop.icon(FILE), { mode: "human" });
        beat("hover-file");
        await cursor.hover(4100);
        beat("select-file");
        await cursor.click({ mode: "human" });
        shell.desktop.select(FILE, { focused: true });
        windows.focusDesktop();
        await cursor.idle(2000);

        await at(22000);
        beat("mia-notify");
        miaArrives(ctx, { silent: false });
        sound.play("M1");
        await cursor.idle(2400);
    },
    apply(ctx) {
        ctx.ui.shell.desktop.select(FILE, { focused: true });
        ctx.ui.windows.focusDesktop();
        ctx.cursor.jump(ctx.ui.shell.desktop.icon(FILE));
        miaArrives(ctx, { silent: true, animate: false });
    }
};
