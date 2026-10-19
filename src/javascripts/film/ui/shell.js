// macOS Sequoia shell: wallpaper, menu bar, desktop icons and Dock.
// Everything time-related reads the story world, never the real clock.

import { formatDockDay, formatMenuClock } from "../world.js";
import { DESKTOP_FILES } from "../data/story.js";

const ASSETS = "assets/film/";
const COLUMN_WIDTH = 110;
const ROW_HEIGHT = 116;

const DOCK_APPS = [
    ["Finder", "finder"], ["Launchpad", "launchpad"], ["Safari", "safari"], ["Messages", "messages"],
    ["Mail", "mail"], ["Photos", "photos"], ["Calendar", null], ["Notes", "notes"], ["Music", "music"],
    ["Pages", "pages"], ["Stickies", "stickies"], ["Preview", "preview"]
];

// Desktop slots: the first six fill the right-hand column, the rest start
// two rows down in the next column, as in the approved mockup.
const SLOTS = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5]];

const ICONS = {
    cloud: '<svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5.5 11.5h9a4 4 0 0 0 .6-7.95A5 5 0 0 0 5.6 4.9 3.3 3.3 0 0 0 5.5 11.5Z"/></svg>',
    wifi: '<svg width="17" height="13" viewBox="0 0 17 13" fill="currentColor"><path d="M8.5 2.2c2.5 0 4.8 1 6.5 2.6l1.2-1.3A11 11 0 0 0 8.5.4 11 11 0 0 0 .8 3.5L2 4.8a9.2 9.2 0 0 1 6.5-2.6Z"/><path d="M8.5 5.6c1.6 0 3 .6 4.1 1.6l1.2-1.3A7.8 7.8 0 0 0 8.5 3.8c-2 0-3.9.8-5.3 2.1l1.2 1.3c1.1-1 2.5-1.6 4.1-1.6Z"/><path d="M8.5 9c.7 0 1.3.3 1.8.7l1.2-1.3A4.5 4.5 0 0 0 8.5 7.2c-1.2 0-2.2.5-3 1.2l1.2 1.3c.5-.4 1.1-.7 1.8-.7Z"/><circle cx="8.5" cy="11.4" r="1.3"/></svg>',
    search: '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6.2" cy="6.2" r="4.6"/><path d="m9.6 9.6 4 4" stroke-linecap="round"/></svg>',
    control: '<svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.3"><rect x=".8" y=".8" width="16.4" height="5" rx="2.5"/><rect x=".8" y="8.2" width="16.4" height="5" rx="2.5"/><circle cx="14.6" cy="3.3" r="1.6" fill="currentColor" stroke="none"/><circle cx="3.4" cy="10.7" r="1.6" fill="currentColor" stroke="none"/></svg>'
};

function batteryIcon(level) {
    const fill = Math.max(1.5, 19 * level / 100);
    return `<svg width="27" height="13" viewBox="0 0 27 13"><rect x=".7" y=".7" width="22.6" height="11.6" rx="3.4" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="1.2"/><rect x="2.4" y="2.4" width="${fill}" height="8.2" rx="1.6" fill="currentColor"/><path d="M24.8 4.6v3.8a2 2 0 0 0 0-3.8Z" fill="currentColor" fill-opacity=".55"/></svg>`;
}

// Finder shows at most two lines and truncates long names in the middle.
// Lines are measured from the rendered label, so it must be in the document.
function fitLabel(label, name) {
    label.textContent = name;
    if (label.getClientRects().length <= 2) return;
    for (let keep = name.length - 1; keep > 4; keep--) {
        label.textContent = `${name.slice(0, Math.ceil(keep / 2))}…${name.slice(name.length - Math.floor(keep / 2))}`;
        if (label.getClientRects().length <= 2) return;
    }
}

const el = (tag, className, html = "") => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.innerHTML = html;
    return node;
};

export function createShell(stage, { world, timeline }) {
    const wallpaper = el("div", "wallpaper");
    const desktopLayer = el("div", "desktop-layer");
    const windowLayer = el("div", "window-layer");
    const menubar = el("div", "menubar glass");
    const dock = el("div", "dock glass");
    stage.append(wallpaper, desktopLayer, windowLayer, menubar, dock);
    wallpaper.style.backgroundImage = `url(${ASSETS}wallpapers/her.jpg)`;

    // Menu bar
    menubar.innerHTML = `
        <div class="mb-left"><span class="mb-apple"></span><span class="mb-app"></span><span class="mb-menus"></span></div>
        <div class="mb-right">
            <span class="mb-extras"></span>
            <span class="mb-icon">${ICONS.cloud}</span>
            <span class="mb-battery"><span class="mb-battery-text"></span><span class="mb-battery-icon"></span></span>
            <span class="mb-icon">${ICONS.wifi}</span>
            <span class="mb-icon">${ICONS.search}</span>
            <span class="mb-icon">${ICONS.control}</span>
            <span class="mb-clock"></span>
        </div>`;
    const extras = menubar.querySelector(".mb-extras");

    // Desktop icons
    const icons = new Map();
    DESKTOP_FILES.forEach((file, index) => {
        const [column, row] = SLOTS[index];
        const icon = el("div", "di", `<div class="di-ic"><img class="${file.page ? "page" : ""}" src="${ASSETS}${file.thumb}"></div><span class="di-label"></span>`);
        icon.dataset.name = file.name;
        icon.style.right = `${14 + column * COLUMN_WIDTH}px`;
        icon.style.top = `${36 + row * ROW_HEIGHT}px`;
        desktopLayer.appendChild(icon);
        fitLabel(icon.querySelector(".di-label"), file.name);
        icons.set(file.name, icon);
    });

    // Dock
    const dockItems = new Map();
    const dockItem = (app, iconUrl) => {
        const item = el("div", "dk");
        item.dataset.app = app;
        item.innerHTML = iconUrl
            ? `<img src="${iconUrl}">`
            : '<div class="dock-cal"><div class="dock-cal-month"></div><div class="dock-cal-day"></div></div>';
        dockItems.set(app, item);
        return item;
    };
    DOCK_APPS.forEach(([app, icon]) => dock.appendChild(dockItem(app, icon && `${ASSETS}icons/${icon}.png`)));
    dock.appendChild(el("div", "dock-sep"));
    dock.appendChild(dockItem("Downloads", `${ASSETS}icons/downloads.png`));
    dock.appendChild(dockItem("Trash", `${ASSETS}icons/trash.png`));

    function render(state) {
        menubar.querySelector(".mb-clock").textContent = formatMenuClock(state.time);
        menubar.querySelector(".mb-battery-text").textContent = `${state.battery}%`;
        menubar.querySelector(".mb-battery-icon").innerHTML = batteryIcon(state.battery);
        const day = formatDockDay(state.time);
        dock.querySelector(".dock-cal-month").textContent = day.month;
        dock.querySelector(".dock-cal-day").textContent = day.day;
        stage.dataset.appearance = state.appearance;
    }
    render(world.get());
    world.subscribe(render);

    return {
        windowLayer,
        wallpaper: {
            set(url) {
                wallpaper.style.backgroundImage = `url(${url})`;
            }
        },
        menubar: {
            setApp(name, menus) {
                menubar.querySelector(".mb-app").textContent = name;
                menubar.querySelector(".mb-menus").innerHTML = menus.map(menu => `<span>${menu}</span>`).join("");
            },
            showExtra(id, svgMarkup) {
                if (extras.querySelector(`[data-extra="${id}"]`)) return;
                const extra = el("span", "mb-icon mb-extra", svgMarkup);
                extra.dataset.extra = id;
                extra.dataset.hoverable = "";
                extras.appendChild(extra);
            },
            extra: id => extras.querySelector(`[data-extra="${id}"]`),
            extras: () => [...extras.children].map(extra => extra.dataset.extra),
            app: () => menubar.querySelector(".mb-app").textContent,
            openExtraMenu(id, items) {
                const anchor = extras.querySelector(`[data-extra="${id}"]`);
                anchor.classList.add("is-open");
                const menu = el("div", "mb-menu glass");
                items.forEach(label => {
                    const item = el("div", "mb-menu-item");
                    item.textContent = label;
                    item.dataset.hoverable = "";
                    menu.appendChild(item);
                });
                stage.appendChild(menu);
                const scale = Number(stage.dataset.scale) || 1;
                const a = anchor.getBoundingClientRect();
                const s = stage.getBoundingClientRect();
                menu.style.left = `${(a.left - s.left) / scale - 8}px`;
                return {
                    item: label => [...menu.children].find(child => child.textContent === label),
                    close() {
                        anchor.classList.remove("is-open");
                        menu.remove();
                    }
                };
            }
        },
        desktop: {
            icon: name => icons.get(name),
            select(name, { focused = true } = {}) {
                icons.forEach(icon => delete icon.dataset.selection);
                icons.get(name).dataset.selection = focused ? "focus" : "blur";
            },
            beginRename(name) {
                const icon = icons.get(name);
                icon.dataset.selection = "focus";
                const label = icon.querySelector(".di-label");
                label.className = "di-label di-rename";
                label.innerHTML = `<span class="rename-sel"></span><span class="rename-text"></span>`;
                label.querySelector(".rename-sel").textContent = name;
                const typing = label.querySelector(".rename-text");
                typing.addEventListener("input", () => label.querySelector(".rename-sel")?.remove(), { once: true });
                icon.dataset.renaming = "";
                return typing;
            },
            endRename() {
                const icon = [...icons.values()].find(i => "renaming" in i.dataset);
                const name = icon.querySelector(".rename-text").textContent;
                icons.delete(icon.dataset.name);
                icons.set(name, icon);
                icon.dataset.name = name;
                delete icon.dataset.renaming;
                const label = icon.querySelector(".di-label");
                label.className = "di-label";
                fitLabel(label, name);
            },
            names: () => [...desktopLayer.querySelectorAll(".di")].map(icon => icon.dataset.name),
            selected() {
                const icon = desktopLayer.querySelector(".di[data-selection]");
                return icon ? { name: icon.dataset.name, state: icon.dataset.selection } : null;
            }
        },
        dock: {
            setRunning(app, on) {
                dockItems.get(app).classList.toggle("run", on);
            },
            setBadge(app, count) {
                const item = dockItems.get(app);
                item.querySelector(".badge")?.remove();
                if (count) item.appendChild(el("span", "badge", String(count)));
            },
            add(app, iconUrl) {
                if (dockItems.has(app)) return;
                dockItems.get("Preview").after(dockItem(app, iconUrl));
            },
            async bounce(app, ms) {
                const img = dockItems.get(app).firstElementChild;
                await timeline.animate(ms, p => {
                    const hop = Math.abs(Math.sin(p * Math.PI * 3)) * (1 - p) * 26;
                    img.style.transform = `translateY(${-hop}px)`;
                });
                img.style.transform = "";
            },
            el: app => dockItems.get(app),
            running: () => [...dockItems.values()].filter(item => item.classList.contains("run")).map(item => item.dataset.app),
            badges: () => Object.fromEntries([...dockItems.values()].filter(item => item.querySelector(".badge")).map(item => [item.dataset.app, item.querySelector(".badge").textContent]))
        }
    };
}
