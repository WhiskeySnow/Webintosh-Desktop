// 11 · Pass it on. Weeks later, same minute of the night. Messages opens by
// itself and invites Daniel. He starts typing. Black. One silent notification.

import { establish } from "./establish.js";
import { scenes } from "./index.js";

export default {
    id: "11-pass-it-on",
    setup: ctx => establish(ctx, 11, scenes),
    async run({ at, beat, keyboard, ui, wait, stage, cursor }) {
        const { grid, notifications, messages, windows } = ui;
        const machine = { mode: "machine" };
        grid.restore();
        notifications.clear();

        await at(1500);
        beat("messages-open");
        messages.open("daniel");
        windows.focus("messages");

        await at(3000);
        beat("type");
        await keyboard.type(messages.input, ["do you want to try something fun???"], machine);
        await wait(300);
        messages.send({ silent: true });

        await at(8500);
        beat("link");
        messages.link("daniel", { from: "me", silent: true });
        messages.receipt("Delivered");

        await at(13000);
        beat("daniel-typing");
        messages.typing(true);

        await at(19000);
        beat("black");
        const black = document.createElement("div");
        black.className = "blackout";
        stage.appendChild(black);
        cursor.el.hidden = true;

        await at(21500);
        beat("final-notify");
        notifications.show({ app: "VOLI", icon: "icons/voli.svg", title: "VOLI", body: "You were going to tell someone eventually.", silent: true });
    },
    apply({ ui }) {
        ui.messages.open("daniel");
        ui.windows.focus("messages");
    }
};
