// 7 · Autopilot. VOLI decides for her, silently and in straight lines: it
// finishes her sentence, settles the transfer, and renames her pros and cons.

import { establish } from "./establish.js";
import { scenes } from "./index.js";

const OLD_NAME = "pros and cons (3).docx";
const NEW_NAME = "decided.docx";

export default {
    id: "07-autopilot",
    setup: ctx => establish(ctx, 7, scenes),
    async run({ at, beat, cursor, keyboard, ui, wait }) {
        const { safari, stickies, shell, windows } = ui;
        const machine = { mode: "machine" };

        await at(500);
        beat("doc");
        await cursor.moveTo(shell.dock.el("Safari"), machine);
        await cursor.click(machine);
        windows.focus("safari");
        await cursor.moveTo(safari.tab(0), machine);
        await cursor.click(machine);
        safari.selectTab(0);
        await cursor.moveTo(safari.docText, { ...machine, offset: { x: 24, y: 0 } });
        await cursor.click(machine);
        await keyboard.type(safari.docText, [" let them."], machine);

        await at(7000);
        beat("sticky");
        await cursor.moveTo(stickies.el, { ...machine, offset: { x: 80, y: 70 } });
        await cursor.click(machine);
        windows.focus("stickies");
        await cursor.moveTo(stickies.line(2), machine);
        stickies.strike(2);
        await wait(500);
        const added = stickies.appendLine();
        await cursor.moveTo(added, machine);
        await keyboard.type(added, ["decided: stay"], machine);

        await at(13500);
        beat("rename");
        await cursor.moveTo(shell.desktop.icon(OLD_NAME), machine);
        await cursor.click(machine);
        shell.desktop.select(OLD_NAME, { focused: true });
        windows.focusDesktop();
        await wait(400);
        const field = shell.desktop.beginRename(OLD_NAME);
        await wait(500);
        await keyboard.type(field, [NEW_NAME], machine);
        await wait(300);
        shell.desktop.endRename();
    },
    apply({ ui }) {
        const { safari, stickies, shell, windows } = ui;
        windows.focus("safari");
        safari.selectTab(0);
        safari.docText.textContent += " let them.";
        windows.focus("stickies");
        stickies.strike(2);
        stickies.appendLine().textContent = "decided: stay";
        shell.desktop.select(OLD_NAME, { focused: true });
        windows.focusDesktop();
        shell.desktop.beginRename(OLD_NAME).textContent = NEW_NAME;
        shell.desktop.endRename();
    }
};
