// Finder: the Time-Based Media folder, the VOLI disk image and Applications.

import { TRAFFIC_LIGHTS } from "./windows.js";

const MENUS = ["File", "Edit", "View", "Go", "Window", "Help"];
const ICONS = "assets/film/icons/";
const FOLDER_ITEMS = [
    ["soundwalk refs", "folder.png"], ["storyboard", "folder.png"], ["week 5 notes.txt", "generic-doc.png"],
    ["audio ideas.m4a", "generic-doc.png"], ["syllabus.pdf", "generic-doc.png"]
];
const APPLICATIONS = [
    ["Calendar", "calendar.png"], ["Mail", "mail.png"], ["Messages", "messages.png"], ["Music", "music.png"],
    ["Notes", "notes.png"], ["Pages", "pages.png"], ["Photos", "photos.png"], ["Preview", "preview.png"],
    ["Safari", "safari.png"], ["Stickies", "stickies.png"], ["System Settings", "settings.png"]
];

const sidebar = current => `
    <div class="fside glass">
        ${TRAFFIC_LIGHTS}
        <div class="fside-h">Favorites</div>
        ${["AirDrop", "Recents", "Applications", "Desktop", "Time-Based Media", "Documents", "Downloads"]
            .map(name => `<div class="fside-it${name === current ? " cur" : ""}">${name}</div>`).join("")}
        <div class="fside-h">iCloud</div><div class="fside-it">iCloud Drive</div>
        <div class="fside-h">Tags</div>
        <div class="fside-it"><span class="tag" style="background:#ff453a"></span>Red</div>
        <div class="fside-it"><span class="tag" style="background:#ffd60a"></span>Yellow</div>
    </div>`;

const grid = items => items.map(([name, icon]) =>
    `<div class="fitem" data-item="${name}" data-hoverable><img src="${ICONS}${icon}"><span>${name}</span></div>`).join("");

export function createFinder(windows, { timeline }) {
    let hasVoli = false;

    function finderWindow() {
        return windows.get("finder") ?? windows.create({ id: "finder", app: "Finder", menus: MENUS, x: 64, y: 70, w: 860, h: 540, className: "finder" });
    }

    function topmost() {
        return ["finder", "dmg"].map(id => windows.get(id)).filter(win => win?.visible)
            .sort((a, b) => Number(b.el.style.zIndex) - Number(a.el.style.zIndex));
    }

    return {
        openFolder(name) {
            const win = finderWindow();
            win.el.innerHTML = `${sidebar(name)}<div class="fmain"><div class="ftool">‹ › &nbsp;${name}</div><div class="fgrid">${grid(FOLDER_ITEMS)}</div></div>`;
            win.show();
        },
        openApplications() {
            const win = finderWindow();
            const apps = hasVoli ? [...APPLICATIONS, ["VOLI", "voli.svg"]].sort((a, b) => a[0].localeCompare(b[0])) : APPLICATIONS;
            win.el.innerHTML = `${sidebar("Applications")}<div class="fmain"><div class="ftool">‹ › &nbsp;Applications</div><div class="fgrid">${grid(apps)}</div></div>`;
            windows.focus("finder");
        },
        openDmg() {
            const win = windows.get("dmg") ?? windows.create({ id: "dmg", app: "Finder", menus: MENUS, x: 660, y: 300, w: 600, h: 400, className: "dmg" });
            win.el.innerHTML = `
                <div class="dmg-bar">${TRAFFIC_LIGHTS}<span>VOLI</span></div>
                <div class="dmg-body">
                    <div class="fitem" data-item="VOLI" data-hoverable><img src="${ICONS}voli.svg"><span>VOLI</span></div>
                    <div class="dmg-arrow">→</div>
                    <div class="fitem" data-item="Applications" data-hoverable><img src="${ICONS}applications.png"><span>Applications</span></div>
                </div>`;
            windows.focus("dmg");
        },
        async copy(ms) {
            const win = windows.create({ id: "copy", app: "Finder", menus: MENUS, x: 760, y: 470, w: 400, h: 96, className: "copy-dialog" });
            win.el.innerHTML = `<div class="copy-text">Copying “VOLI” to “Applications”</div><div class="copy-bar"><i></i></div>`;
            windows.focus("copy");
            const bar = win.el.querySelector(".copy-bar i");
            await timeline.animate(ms, p => { bar.style.width = `${p * 100}%`; });
            win.close();
            hasVoli = true;
            windows.focus("dmg");
        },
        item(name) {
            for (const win of topmost()) {
                const found = win.el.querySelector(`[data-item="${name}"]`);
                if (found) return found;
            }
            return null;
        },
        get hasVoli() {
            return hasVoli;
        },
        set hasVoli(value) {
            hasVoli = value;
        }
    };
}
