// The film always renders on a fixed 1920×1080 stage, scaled evenly to the
// window and centred, with black bars when the window is not 16:9.

export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

export function mountStage(root) {
    const el = document.createElement("div");
    el.id = "stage";
    root.appendChild(el);

    function fit() {
        const scale = Math.min(innerWidth / STAGE_WIDTH, innerHeight / STAGE_HEIGHT);
        const left = (innerWidth - STAGE_WIDTH * scale) / 2;
        const top = (innerHeight - STAGE_HEIGHT * scale) / 2;
        el.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
        el.dataset.scale = String(scale);
    }

    fit();
    addEventListener("resize", fit);
    return { el, fit };
}
