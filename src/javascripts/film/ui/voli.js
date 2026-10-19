// VOLI, styled as if it were part of macOS (direction B). Its words are fixed
// by the script; it has no sounds of its own.

import { TRAFFIC_LIGHTS } from "./windows.js";
import { HOVER } from "../data/story.js";

const MENUS = ["File", "Edit", "View", "Window", "Help"];
const ICON = "assets/film/icons/voli.svg";
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const VOLI_GLYPH = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1.5" y="1.5" width="13" height="13" rx="3.5"/><path d="M5 5l6 6"/><circle cx="5" cy="5" r="1.4" fill="currentColor" stroke="none"/><circle cx="11" cy="11" r="1.4" fill="currentColor" stroke="none"/></svg>';

const esc = text => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const buttons = (...labels) => `<div class="v-btns">${labels.map(([label, primary]) =>
    `<button class="v-btn${primary ? " pri" : ""}" data-hoverable>${esc(label)}</button>`).join("")}</div>`;

const SCREENS = {
    welcome: () => `
        <img class="v-icon" src="${ICON}">
        <h1>Let’s get to know you.</h1>
        <p class="v-sub">Five quick choices. There are no right answers.</p>
        ${buttons(["Get Started", true])}`,
    question: ({ index, prompt, options }) => `
        <img class="v-icon small" src="${ICON}">
        <div class="v-label">Getting to know you · ${index} of 5</div>
        <h1>${esc(prompt)}</h1>
        <div class="v-options">${options.map(option => `<button class="v-option" data-hoverable>${esc(option)}</button>`).join("")}</div>`,
    observation: () => `
        <img class="v-icon" src="${ICON}">
        <div class="v-label">Getting to know you · Done</div>
        <h1>You hovered over “Stay comfortable”<br>for ${HOVER.stay} seconds.</h1>
        <div class="vcard">
            <div class="v-row"><span>Stay comfortable</span><i style="width:100%" class="gray"></i><span>${HOVER.stay} s</span></div>
            <div class="v-row"><span>Know the truth</span><i style="width:${Math.round(HOVER.truth / HOVER.stay * 100)}%" class="blue"></i><span>${HOVER.truth} s</span></div>
            <div class="v-cap">Hover time before you chose “Know the truth.”</div>
        </div>`,
    autopilot: () => `
        <img class="v-icon" src="${ICON}">
        <div class="v-label">Deciding is tiring.</div>
        <h1>You don’t have to decide.<br>If it’s wrong, it’s on me.</h1>
        ${buttons(["Not Now"], ["Turn On Autopilot", true])}`,
    control: () => `
        <img class="v-icon" src="${ICON}">
        <h1>Do you feel in control?</h1>
        ${buttons(["No"], ["Yes", true])}`,
    thanks: () => `
        <img class="v-icon" src="${ICON}">
        <h1>Thank you.</h1>
        <p class="v-sub">I knew you would.</p>`,
    daily: ({ day }) => `
        <img class="v-icon small" src="${ICON}">
        <div class="v-label">${WEEKDAYS[day.date.getDay()]}, ${MONTHS[day.date.getMonth()]} ${day.date.getDate()} · Day ${day.day}</div>
        <h1>Today’s choices</h1>
        <div class="vcard v-list">${day.items.map(([label, value]) => `<div class="v-item"><span>${esc(label)} — ${esc(value)}</span><span class="v-check">✓</span></div>`).join("")}</div>
        ${buttons(["Accept All", true])}
        <div class="v-accepted" hidden></div>`
};

export function createVoli(windows) {
    const win = windows.create({ id: "voli", app: "VOLI", menus: MENUS, x: 520, y: 200, w: 880, h: 560, className: "voli" });
    win.hide();
    win.el.innerHTML = `<div class="v-bar">${TRAFFIC_LIGHTS}<span>VOLI</span></div><div class="voli-body"></div>`;
    const body = win.el.querySelector(".voli-body");
    let screen = null;

    const find = (selector, label) => [...body.querySelectorAll(selector)].find(node => node.textContent === label);

    return {
        el: win.el,
        menuExtraSvg: VOLI_GLYPH,
        get screen() {
            return screen;
        },
        open: () => win.show(),
        close: () => win.hide(),
        show(name, data = {}) {
            screen = name;
            body.dataset.screen = name;
            body.innerHTML = SCREENS[name](data);
            if (name === "daily") {
                find(".v-btn", "Accept All").addEventListener("click", () => {
                    const note = body.querySelector(".v-accepted");
                    note.textContent = `Accepted in ${data.day.acceptedIn} s`;
                    note.hidden = false;
                });
            }
        },
        button: label => find(".v-btn", label),
        option: label => find(".v-option", label),
        appendLine(text) {
            const line = document.createElement("p");
            line.className = "v-line";
            line.textContent = text;
            body.querySelector(".vcard").after(line);
            requestAnimationFrame(() => requestAnimationFrame(() => line.classList.add("in")));
            return line;
        }
    };
}
