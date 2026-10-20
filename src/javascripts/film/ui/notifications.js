// macOS notification banners, newest on top. They stay until a scene
// dismisses them, so every frame is reproducible.

const ASSETS = "assets/film/";

export function createNotifications(stage, { sound }) {
    const layer = document.createElement("div");
    layer.className = "nc";
    stage.appendChild(layer);
    let lastApp = null;

    return {
        show({ app, icon, calendar, title, body, time = "now", silent = false, animate = true }) {
            const banner = document.createElement("div");
            banner.className = "nb glass";
            banner.dataset.app = app;
            banner.dataset.hoverable = "";
            const art = calendar
                ? `<div class="nb-cal"><div>${calendar.month}</div><div>${calendar.day}</div></div>`
                : `<img class="nb-icon" src="${ASSETS}${icon}">`;
            banner.innerHTML = `${art}<div class="nb-text"><div class="nb-head"><b class="nb-title"></b><em></em></div><div class="nb-body"></div></div>`;
            banner.querySelector(".nb-title").textContent = title;
            banner.querySelector("em").textContent = time;
            banner.querySelector(".nb-body").textContent = body;
            if (app === lastApp && layer.firstElementChild) {
                banner.classList.add("stack");
            }
            layer.prepend(banner);
            lastApp = app;
            if (animate) requestAnimationFrame(() => banner.classList.add("in"));
            else banner.classList.add("in");
            if (!silent) sound.play(app === "Messages" ? "receive" : "notify");
            return banner;
        },
        dismiss(banner) {
            banner.remove();
            lastApp = layer.firstElementChild?.dataset.app ?? null;
        },
        count: () => layer.children.length,
        clear() {
            layer.innerHTML = "";
            lastApp = null;
        }
    };
}
