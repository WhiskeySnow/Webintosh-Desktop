// One still frame per wall screen (?thumb=<id>), captured by
// tools/render-grid-thumbs.mjs into assets/film/grid/.

import { base } from "./establish.js";
import { DAYS } from "../data/story.js";
import { GRID_VARIANTS } from "../data/grid-variants.js";

export function renderThumb(ctx, id) {
    const variant = GRID_VARIANTS.find(v => v.id === id);
    if (!variant) throw new Error(`Unknown thumb "${id}"`);
    const { ui, world, cursor } = ctx;
    const { shell, voli, windows, messages, finder, stickies, notifications } = ui;
    base(ctx);
    world.set({ time: variant.time, battery: variant.battery, appearance: variant.appearance });
    shell.wallpaper.set(`assets/film/${variant.wallpaper}`);
    shell.dock.setRunning("Music", true);
    shell.dock.add("VOLI", "assets/film/icons/voli.svg");
    shell.dock.setRunning("VOLI", true);
    shell.menubar.showExtra("voli", voli.menuExtraSvg);

    if (variant.kind === "her") {
        const template = DAYS[variant.day % 4];
        voli.open();
        voli.show("daily", { day: { ...template, day: variant.day, date: variant.time, acceptedIn: variant.acceptedIn } });
        windows.focus("voli");
        voli.button("Accept All").click();
        cursor.jump(voli.button("Accept All"), { x: 6, y: 4 });
        return;
    }

    ctx.stage.querySelector(".desktop-layer").hidden = true;
    stickies.el.hidden = variant.layout !== "finder";
    if (variant.layout === "docs") {
        windows.focus("safari");
    } else if (variant.layout === "messages") {
        messages.open("mia");
        windows.focus("messages");
    } else if (variant.layout === "voli") {
        voli.open();
        voli.show("daily", { day: DAYS[variant.time.getDate() % 4] });
        windows.focus("voli");
    } else {
        finder.openApplications();
        windows.focus("finder");
    }
    notifications.clear();
}
