// 9 · Can't quit. Quitting closes the window but not the menu bar icon, and
// Finder refuses to trash an app that is open.

import { establish } from "./establish.js";
import { scenes } from "./index.js";

export default {
    id: "09-cant-quit",
    setup: ctx => establish(ctx, 9, scenes),
    async run({ at, beat, cursor, ui }) {
        const { shell, voli, finder, system, notifications } = ui;
        const human = { mode: "human" };
        notifications.clear();

        await at(500);
        beat("extra-menu");
        await cursor.moveTo(shell.menubar.extra("voli"), human);
        await cursor.click(human);
        const menu = shell.menubar.openExtraMenu("voli", ["Open VOLI", "Quit VOLI"]);

        await at(2000);
        beat("quit");
        await cursor.moveTo(menu.item("Quit VOLI"), human);
        await cursor.click(human);
        menu.close();
        voli.close();

        await at(4500);
        beat("apps");
        await cursor.moveTo(shell.dock.el("Finder"), human);
        await cursor.click(human);
        finder.openApplications();

        await at(6500);
        beat("drag-trash");
        await cursor.drag(finder.item("VOLI"), shell.dock.el("Trash"), human);

        await at(9500);
        beat("error");
        const error = system.trashError("VOLI");
        await cursor.idle(1800);

        await at(12000);
        beat("ok");
        await cursor.moveTo(error.button("OK"), human);
        await cursor.click(human);
        error.close();
    },
    apply({ ui, cursor }) {
        ui.notifications.clear();
        ui.voli.close();
        ui.finder.openApplications();
        const error = ui.system.trashError("VOLI", { silent: true });
        cursor.jump(error.button("OK"));
        error.close();
    }
};
