// macOS Messages: pinned conversations, a recency-sorted list, "To:" header,
// tails only on the last bubble of a run, read receipts, link cards and the
// typing bubble. Every time label is relative to the story clock.

import { TRAFFIC_LIGHTS } from "./windows.js";
import { CONTACTS, MIA_HISTORY } from "../data/story.js";
import { formatChatStamp, formatListLabel } from "../world.js";

const ASSETS = "assets/film/";
const MENUS = ["File", "Edit", "View", "Conversations", "Window", "Help"];
const STAMP_GAP_MS = 15 * 60 * 1000;
const MOON = '<svg class="moon" width="10" height="10" viewBox="0 0 10 10"><path d="M6.5 1A4 4 0 1 0 9 7.6 3.3 3.3 0 0 1 6.5 1Z" fill="currentColor"/></svg>';
const COMPOSE = '<svg width="20" height="19" viewBox="0 0 20 19" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 3H4.5A2.5 2.5 0 0 0 2 5.5v9A2.5 2.5 0 0 0 4.5 17h9a2.5 2.5 0 0 0 2.5-2.5V9"/><path d="m8 11 1-3.5 7-7 2.5 2.5-7 7Z"/></svg>';
const VIDEO = '<svg width="22" height="15" viewBox="0 0 22 15" fill="none" stroke="currentColor" stroke-width="1.5"><rect x=".8" y="1.8" width="13.4" height="11.4" rx="3"/><path d="m14.5 6 6-3.5v10l-6-3.5"/></svg>';
const INFO = '<svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8.5" cy="8.5" r="7.5"/><path d="M8.5 7.4v4.6"/><circle cx="8.5" cy="4.9" r=".6" fill="currentColor"/></svg>';
const WAVE = '<svg width="16" height="14" viewBox="0 0 16 14" fill="currentColor"><rect y="5" width="2" height="4" rx="1"/><rect x="3.5" y="2" width="2" height="10" rx="1"/><rect x="7" width="2" height="14" rx="1"/><rect x="10.5" y="3" width="2" height="8" rx="1"/><rect x="14" y="5.5" width="2" height="3" rx="1"/></svg>';

function avatar(contact, size) {
    const inner = contact.avatar ? `<img src="${ASSETS}${contact.avatar}">` : contact.initials;
    return `<div class="mav" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.38)}px">${inner}</div>`;
}

export function createMessages(windows, { world, sound }) {
    const win = windows.create({ id: "messages", app: "Messages", menus: MENUS, x: 420, y: 104, w: 1120, h: 790, className: "messages" });
    win.hide();
    const el = win.el;
    el.innerHTML = `
        <div class="ms glass">
            <div class="ms-top">${TRAFFIC_LIGHTS}<span class="ms-compose">${COMPOSE}</span></div>
            <div class="ms-search"><svg width="12" height="12" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6.2" cy="6.2" r="4.6"/><path d="m9.6 9.6 4 4"/></svg>Search</div>
            <div class="ms-pins"></div>
            <div class="ms-rows"></div>
        </div>
        <div class="mm">
            <div class="mh"><span class="mh-to"></span><span class="mh-icons">${VIDEO}${INFO}</span></div>
            <div class="chat"></div>
            <div class="cmp"><span class="cmp-plus">+</span><div class="cmp-field empty"><span class="cmp-input"></span><span class="cmp-caret"></span>${WAVE}</div></div>
        </div>`;

    const chat = el.querySelector(".chat");
    const input = el.querySelector(".cmp-input");
    const field = el.querySelector(".cmp-field");
    const caret = el.querySelector(".cmp-caret");
    let blinkTimer;
    // Like macOS: the caret stays solid while keys are pressed, then blinks.
    input.addEventListener("input", () => {
        field.classList.toggle("empty", input.textContent === "");
        caret.classList.add("solid");
        clearTimeout(blinkTimer);
        blinkTimer = setTimeout(() => caret.classList.remove("solid"), 500);
    });
    const contacts = new Map(CONTACTS.map(contact => [contact.id, { ...contact, muted: false }]));
    const threads = new Map(CONTACTS.map(contact => [contact.id, contact.last ? [{ from: "them", text: contact.last.text, time: contact.last.time }] : []]));
    threads.set("mia", MIA_HISTORY.map(item => ({ ...item })));
    let current = null;

    const lastTime = id => threads.get(id).at(-1)?.time ?? contacts.get(id).last?.time ?? new Date(2000, 0, 1);
    const preview = id => {
        const last = threads.get(id).at(-1);
        return last ? (last.kind === "link" ? "voli.app" : last.text) : "";
    };

    function renderSidebar() {
        const now = world.get().time;
        el.querySelector(".ms-pins").innerHTML = [...contacts.values()].filter(c => c.pinned).map(c => `
            <div class="mpin${c.id === current ? " cur" : ""}" data-contact="${c.id}" data-hoverable>
                ${avatar(c, 62)}<span>${c.short}${c.muted ? MOON : ""}</span>
            </div>`).join("");
        const rows = [...contacts.values()].filter(c => !c.pinned).sort((a, b) => lastTime(b.id) - lastTime(a.id));
        el.querySelector(".ms-rows").innerHTML = rows.map(c => `
            <div class="mrow${c.id === current ? " cur" : ""}" data-contact="${c.id}" data-hoverable>
                ${c.unread ? '<span class="mrow-dot"></span>' : ""}${avatar(c, 42)}
                <div class="mrow-copy">
                    <div class="mrow-top"><span class="mrow-name">${c.name}${c.muted ? MOON : ""}</span><em>${formatListLabel(lastTime(c.id), now)}</em></div>
                    <div class="mrow-preview"></div>
                </div>
            </div>`).join("");
        rows.forEach(c => { el.querySelector(`.mrow[data-contact="${c.id}"] .mrow-preview`).textContent = preview(c.id); });
    }

    function retail() {
        const bubbles = [...chat.querySelectorAll(".bubble")];
        bubbles.forEach((bubble, i) => {
            const next = bubbles[i + 1];
            const endsRun = !next || next.dataset.from !== bubble.dataset.from || next.previousElementSibling?.classList.contains("stamp");
            bubble.classList.toggle("tail", endsRun && !bubble.classList.contains("link-card"));
        });
    }

    function appendItem(item, previous) {
        const now = world.get().time;
        if (!previous || item.time - previous.time > STAMP_GAP_MS) {
            const { day, time } = formatChatStamp(item.time, now);
            const stamp = document.createElement("div");
            stamp.className = "stamp";
            stamp.innerHTML = `<b>${day}</b> ${time}`;
            chat.appendChild(stamp);
        }
        let node;
        if (item.kind === "link") {
            node = document.createElement("div");
            node.className = "bubble link-card";
            node.innerHTML = `<div class="link-img"><img src="${ASSETS}icons/voli.svg"></div><div class="link-text"><b class="link-title">VOLI — How well can an algorithm know you?</b><span>voli.app</span></div>`;
        } else {
            node = document.createElement("div");
            node.className = "bubble";
            node.textContent = item.text;
        }
        node.dataset.from = item.from;
        if (previous && previous.from !== item.from) node.classList.add("turn");
        chat.appendChild(node);
        return node;
    }

    function renderThread(id) {
        chat.innerHTML = "";
        let previous = null;
        threads.get(id).forEach(item => {
            appendItem(item, previous);
            previous = item;
        });
        retail();
    }

    function add(id, item, silent) {
        chat.querySelector(".typing")?.remove();
        const thread = threads.get(id);
        const node = appendItem(item, thread.at(-1));
        thread.push(item);
        const receipt = chat.querySelector(".receipt");
        if (receipt && item.from === "me") receipt.remove();
        retail();
        renderSidebar();
        if (!silent) sound.play(item.from === "me" ? "send" : "receive");
        return node;
    }

    world.subscribe(() => renderSidebar());
    renderSidebar();

    return {
        el,
        input,
        open(id) {
            current = id;
            const contact = contacts.get(id);
            contact.unread = false;
            el.querySelector(".mh-to").innerHTML = `<span class="mh-label">To:</span> ${contact.name}`;
            renderThread(id);
            renderSidebar();
            win.show();
        },
        bubble(id, { from, text, kind = "text", silent = false }) {
            return add(id, { from, text, kind, time: world.get().time }, silent);
        },
        link(id, { from, silent = false }) {
            return add(id, { from, kind: "link", time: world.get().time }, silent);
        },
        send({ silent = false } = {}) {
            const text = input.textContent.trim();
            input.textContent = "";
            field.classList.add("empty");
            return add(current, { from: "me", text, time: world.get().time }, silent);
        },
        typing(on) {
            chat.querySelector(".typing")?.remove();
            if (on) {
                const dots = document.createElement("div");
                dots.className = "typing";
                dots.innerHTML = "<i></i><i></i><i></i>";
                chat.appendChild(dots);
            }
        },
        receipt(text) {
            chat.querySelector(".receipt")?.remove();
            const mine = [...chat.querySelectorAll('.bubble[data-from="me"]')].at(-1);
            if (!mine) return;
            const receipt = document.createElement("div");
            receipt.className = "receipt";
            const [word, ...rest] = text.split(" ");
            receipt.innerHTML = `<b>${word}</b> ${rest.join(" ")}`;
            mine.after(receipt);
        },
        mute(id) {
            contacts.get(id).muted = true;
            renderSidebar();
        },
        listLabel: id => formatListLabel(lastTime(id), world.get().time),
        snapshot: () => ({
            open: current,
            counts: Object.fromEntries([...threads].map(([id, items]) => [id, items.length])),
            muted: [...contacts.values()].filter(c => c.muted).map(c => c.id),
            links: [...threads.values()].flat().filter(item => item.kind === "link").length,
            lastMine: current ? threads.get(current).filter(item => item.from === "me").at(-1)?.text ?? null : null
        })
    };
}
