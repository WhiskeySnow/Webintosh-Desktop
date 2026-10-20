// macOS system alerts (Gatekeeper, Accessibility, Trash) and the
// Privacy & Security → Accessibility pane of System Settings.

import { TRAFFIC_LIGHTS } from "./windows.js";

const ASSETS = "assets/film/";
const SETTINGS_MENUS = ["Edit", "View", "Window", "Help"];
const SIDEBAR = ["Wi‑Fi", "Bluetooth", "Network", "Notifications", "Sound", "Focus", "Screen Time", "General", "Appearance", "Accessibility", "Control Center", "Siri & Spotlight", "Privacy & Security", "Desktop & Dock", "Displays", "Wallpaper", "Battery", "Lock Screen", "Touch ID & Password", "Users & Groups"];
let dialogCount = 0;

const esc = text => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function createSystem(windows, { sound }) {
    function alert({ app, icon, badge, title, detail, buttons, vertical = false }) {
        const id = `alert-${++dialogCount}`;
        const win = windows.create({ id, app, menus: ["File", "Edit", "Window", "Help"], x: 830, y: 330, w: 260, h: 0, className: "alert glass" });
        win.el.style.height = "auto";
        win.el.innerHTML = `
            <div class="alert-icon"><img src="${ASSETS}${icon}">${badge ? `<img class="alert-badge" src="${ASSETS}${badge}">` : ""}</div>
            <div class="alert-title">${esc(title)}</div>
            ${detail ? `<div class="alert-detail">${esc(detail)}</div>` : ""}
            <div class="alert-btns${vertical ? " vertical" : ""}">${buttons.map(([label, primary]) =>
                `<button class="alert-btn${primary ? " pri" : ""}" data-hoverable>${esc(label)}</button>`).join("")}</div>`;
        windows.focus(id);
        return {
            el: win.el,
            button: label => [...win.el.querySelectorAll(".alert-btn")].find(b => b.textContent === label),
            close: () => win.close()
        };
    }

    const rows = new Map();
    const settings = {
        openAccessibility(apps) {
            const win = windows.get("settings") ?? windows.create({ id: "settings", app: "System Settings", menus: SETTINGS_MENUS, x: 560, y: 150, w: 820, h: 620, className: "settings" });
            win.el.innerHTML = `
                <div class="set-side glass">
                    ${TRAFFIC_LIGHTS}
                    <div class="set-search">Search</div>
                    <div class="set-user"><div class="set-avatar"></div><div><b>Apple Account</b><span>Sign in</span></div></div>
                    ${SIDEBAR.map(name => `<div class="set-item${name === "Privacy & Security" ? " cur" : ""}">${name}</div>`).join("")}
                </div>
                <div class="set-main">
                    <div class="set-head"><span class="set-nav">‹ ›</span><span class="set-title">Accessibility</span></div>
                    <div class="set-body">
                        <p class="set-desc">Allow the applications below to control your computer.</p>
                        <div class="set-card"></div>
                        <div class="set-pm"><span>+</span><span>−</span></div>
                    </div>
                </div>`;
            const card = win.el.querySelector(".set-card");
            rows.clear();
            apps.forEach(({ name, icon, on }) => {
                const row = document.createElement("div");
                row.className = "acc-row";
                row.innerHTML = `<img src="${ASSETS}${icon}"><span class="acc-name">${esc(name)}</span><span class="acc-toggle${on ? " on" : ""}" data-hoverable><i></i></span>`;
                card.appendChild(row);
                rows.set(name, row);
            });
            windows.focus("settings");
        },
        toggle: name => rows.get(name).querySelector(".acc-toggle"),
        setOn(name, on, { sound: id } = {}) {
            settings.toggle(name).classList.toggle("on", on);
            if (id) sound.play(id);
        }
    };

    return {
        gatekeeper: ({ app, browser, time, host }) => alert({
            app: "Finder",
            icon: "icons/voli.svg",
            title: `“${app}” is an app downloaded from the Internet. Are you sure you want to open it?`,
            detail: `${browser} downloaded this file today at ${time} from ${host}.`,
            buttons: [["Cancel"], ["Open", true]]
        }),
        accessibilityPrompt: app => alert({
            app,
            icon: "icons/voli.svg",
            badge: "icons/settings.png",
            title: `“${app}” would like to control this computer using accessibility features.`,
            detail: "Grant access to this application in Privacy & Security settings, located in System Settings.",
            buttons: [["Open System Settings", true], ["Deny"]],
            vertical: true
        }),
        trashError(app, { silent = false } = {}) {
            const dialog = alert({
                app: "Finder",
                icon: "icons/finder.png",
                title: `The item “${app}” can’t be moved to the Trash because it’s open.`,
                buttons: [["OK", true]]
            });
            if (!silent) sound.play("finderError");
            return dialog;
        },
        settings
    };
}
