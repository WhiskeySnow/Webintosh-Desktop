// Rebuilds the exact state at the start of any scene, so `?scene=N` plays the
// same as reaching scene N in a full run. Each scene module exports `apply`,
// an instant and silent version of what it leaves behind.

import { TIMELINE } from "../data/story.js";

export function base({ ui, world, cursor }) {
    const { shell, finder, safari, stickies, windows } = ui;
    world.set(TIMELINE[0]);
    ["Finder", "Safari", "Messages", "Mail", "Calendar", "Stickies"].forEach(app => shell.dock.setRunning(app, true));
    shell.dock.setBadge("Mail", 214);
    shell.desktop.select("unsent.txt", { focused: false });
    finder.openFolder("Time-Based Media");
    safari.openDocs();
    stickies.open();
    windows.focus("safari");
    cursor.jump(safari.docText, { x: 40, y: 34 });
}

export async function establish(ctx, index, scenes) {
    base(ctx);
    for (const scene of scenes.slice(0, index)) {
        scene.apply(ctx);
    }
    ctx.world.set(TIMELINE[index]);
}

export function snapshot({ ui, world }) {
    const { shell, windows, safari, stickies, messages, voli, finder, notifications } = ui;
    const state = world.get();
    return {
        world: { time: state.time.getTime(), battery: state.battery, appearance: state.appearance },
        menuApp: shell.menubar.app(),
        windows: windows.snapshot(),
        docText: safari.docText.textContent,
        sticky: stickies.lines(),
        desktop: shell.desktop.names(),
        selection: shell.desktop.selected(),
        dock: { running: shell.dock.running(), badges: shell.dock.badges() },
        extras: shell.menubar.extras(),
        messages: messages.snapshot(),
        voli: voli.screen,
        finderHasVoli: finder.hasVoli,
        notifications: notifications.count?.()
    };
}
