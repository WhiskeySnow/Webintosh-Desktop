// Window frames and focus. The focused window gets coloured traffic lights
// and a deep shadow; every other window goes grey and flat, like macOS.

export const TRAFFIC_LIGHTS = '<div class="tl"><i></i><i></i><i></i></div>';

export function createWindows(stage, { shell }) {
    const layer = shell.windowLayer;
    const windows = new Map();
    let order = 10;

    const api = {
        create({ id, app, menus, x, y, w, h, className = "" }) {
            const el = document.createElement("div");
            el.className = `win inactive ${className}`.trim();
            el.id = `win-${id}`;
            Object.assign(el.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, zIndex: String(order++) });
            layer.appendChild(el);
            const win = {
                id,
                app,
                menus,
                el,
                body: el,
                visible: true,
                show() {
                    win.visible = true;
                    el.hidden = false;
                },
                hide() {
                    win.visible = false;
                    el.hidden = true;
                },
                close() {
                    el.remove();
                    windows.delete(id);
                }
            };
            windows.set(id, win);
            return win;
        },
        focus(id) {
            windows.forEach(win => {
                const active = win.id === id;
                win.el.classList.toggle("active", active);
                win.el.classList.toggle("inactive", !active);
            });
            const win = windows.get(id);
            win.show();
            win.el.style.zIndex = String(order++);
            shell.menubar.setApp(win.app, win.menus);
        },
        get: id => windows.get(id),
        snapshot: () => [...windows.values()].map(win => ({ id: win.id, visible: win.visible, active: win.el.classList.contains("active") }))
    };
    return api;
}
