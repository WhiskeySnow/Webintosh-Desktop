// Safari with the half-written Google Doc, and the voli.app download page.

import { TRAFFIC_LIGHTS } from "./windows.js";
import { DOC_TEXT } from "../data/story.js";

const MENUS = ["File", "Edit", "View", "History", "Bookmarks", "Window", "Help"];
const LOCK = '<svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor"><rect x="1" y="5" width="8" height="6.5" rx="1.3"/><path d="M3 5V3.4a2 2 0 0 1 4 0V5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
const SIDEBAR = '<svg width="20" height="16" viewBox="0 0 20 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x=".8" y=".8" width="18.4" height="14.4" rx="3"/><path d="M7 1v14"/></svg>';
const DOCS_ICON = '<svg width="26" height="34" viewBox="0 0 26 34"><path d="M2 0h16l8 8v24a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2Z" fill="#4285f4"/><path d="M18 0v8h8" fill="#a1c2fa"/><path d="M6 16h14M6 20h14M6 24h14M6 28h9" stroke="#fff" stroke-width="2"/></svg>';

export function createSafari(windows, { timeline }) {
    const win = windows.create({ id: "safari", app: "Safari", menus: MENUS, x: 330, y: 116, w: 1080, h: 770, className: "safari" });
    win.hide();
    const el = win.el;
    el.innerHTML = `
        <div class="stool">
            ${TRAFFIC_LIGHTS}
            <span class="stool-icon">${SIDEBAR}</span>
            <span class="stool-nav">‹</span><span class="stool-nav dim">›</span>
            <div class="saddr">${LOCK}<span class="saddr-text"></span></div>
            <span class="stool-dl" hidden><svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7.5" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2"/><circle class="dl-ring" cx="9" cy="9" r="7.5" fill="none" stroke="#0a84ff" stroke-width="2" stroke-dasharray="47.1" stroke-dashoffset="47.1" transform="rotate(-90 9 9)"/></svg></span>
            <span class="stool-icon">⇪</span><span class="stool-icon big">+</span><span class="stool-icon">⧉</span>
        </div>
        <div class="stabs"></div>
        <div class="spage docs" hidden>
            <div class="gdh">${DOCS_ICON}
                <div><div class="gd-title">${DOC_TEXT.title} (draft 4)</div>
                <div class="gd-menu"><span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Tools</span><span>Extensions</span><span>Help</span></div></div>
                <span class="gd-share">Share</span><span class="gd-me"></span>
            </div>
            <div class="gdtb"><span>↶</span><span>↷</span><span>⎙</span><i></i><span>100%</span><i></i><span>Normal text ▾</span><i></i><span>Arial ▾</span><i></i><span>− 11 +</span><i></i><b>B</b><em>I</em><u>U</u></div>
            <div class="gdcanvas"><div class="gdpage" data-text>
                <h1>${DOC_TEXT.title}</h1>
                <p><b>Working title:</b> ${DOC_TEXT.workingTitle}</p>
                <p class="gd-concept"><b>Concept:</b> <span class="gd-lead"></span><span class="gd-typing"></span><span class="caret"></span></p>
            </div></div>
        </div>
        <div class="spage voli-site" hidden>
            <div class="vs-nav"><img src="assets/film/icons/voli.svg"><b>VOLI</b><span>How it works</span><span>Privacy</span><span>Support</span></div>
            <div class="vs-hero">
                <img class="vs-icon" src="assets/film/icons/voli.svg">
                <h1>How well can an algorithm know you?</h1>
                <p>Five quick choices. VOLI learns the rest.</p>
                <button class="vs-download" data-hoverable>Download for Mac</button>
                <small>Requires macOS 14 or later</small>
                <div class="vs-social">Join 2.1 million people who decide less.</div>
            </div>
        </div>
        <div class="dl-pop glass" hidden><div class="dl-item" data-hoverable><img src="assets/film/icons/generic-doc.png"><div><div class="dl-name"></div><div class="dl-size">6.2 MB</div></div></div></div>`;

    const lead = DOC_TEXT.concept.slice(0, -"I just".length);
    el.querySelector(".gd-lead").textContent = lead;
    el.querySelector(".gd-typing").textContent = "I just";

    const tabs = el.querySelector(".stabs");
    function setTabs(list, active) {
        tabs.innerHTML = list.map(([color, title], i) =>
            `<div class="stab${i === active ? " on" : ""}"><span class="fav" style="background:${color}"></span>${title}</div>`).join("");
    }
    function showPage(name, address) {
        el.querySelectorAll(".spage").forEach(page => { page.hidden = !page.classList.contains(name); });
        el.querySelector(".saddr-text").textContent = address;
    }
    const docsTabs = [
        ["#4285f4", "TBM Midterm Proposal (draft 4) – Google Docs"],
        ["#ff0033", "how to stop overthinking every decision – YouTube"],
        ["#e4572e", "Time-Based Media – Assignments"]
    ];

    return {
        el,
        docText: el.querySelector(".gd-typing"),
        downloadButton: el.querySelector(".vs-download"),
        downloadItem: el.querySelector(".dl-item"),
        openDocs() {
            setTabs(docsTabs, 0);
            showPage("docs", "docs.google.com");
            win.show();
        },
        openVoliSite() {
            setTabs([...docsTabs, ["#1d1d1f", "VOLI — How well can an algorithm know you?"]], 3);
            showPage("voli-site", "voli.app");
            win.show();
        },
        async download(name, ms) {
            const button = el.querySelector(".stool-dl");
            const ring = el.querySelector(".dl-ring");
            button.hidden = false;
            el.querySelector(".dl-name").textContent = name;
            await timeline.animate(ms, p => ring.setAttribute("stroke-dashoffset", String(47.1 * (1 - p))));
            el.querySelector(".dl-pop").hidden = false;
        },
        hideDownloads() {
            el.querySelector(".dl-pop").hidden = true;
        }
    };
}
