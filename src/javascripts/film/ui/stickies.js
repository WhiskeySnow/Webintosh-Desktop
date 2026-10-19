// The yellow Stickies note. VOLI later crosses out a line and writes a new one.

import { STICKY_LINES } from "../data/story.js";

export function createStickies(windows) {
    const win = windows.create({ id: "stickies", app: "Stickies", menus: ["File", "Edit", "Font", "Color", "Window", "Help"], x: 1438, y: 590, w: 236, h: 196, className: "sticky" });
    win.hide();
    win.el.innerHTML = `<div class="sticky-bar"><i></i><i></i></div><div class="sticky-text" data-text></div>`;
    const text = win.el.querySelector(".sticky-text");
    STICKY_LINES.forEach(line => {
        const span = document.createElement("div");
        span.className = "sticky-line";
        span.textContent = line;
        text.appendChild(span);
    });

    return {
        el: win.el,
        open: () => win.show(),
        line: i => text.children[i],
        strike(i) {
            text.children[i].classList.add("struck");
        },
        appendLine() {
            const span = document.createElement("div");
            span.className = "sticky-line";
            text.appendChild(span);
            return span;
        },
        lines: () => [...text.children].map(line => ({ text: line.textContent, struck: line.classList.contains("struck") }))
    };
}
