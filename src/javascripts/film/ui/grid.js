// The pull-back in scene 10: her live screen shrinks into a wall of other
// screens. Everything on the stage moves into a "zoomer" that scales down
// around its centre while pre-rendered screens fill the space around it.

import { makeRng } from "../motion.js";

const W = 1920;
const H = 1080;
const GAP = 80;
const ASSETS = "assets/film/";

export function createGrid(stage, { timeline }) {
    let zoomer = null;
    let farUsed = new Set();

    return {
        build({ near, far, cols = 21, rows = 21, seed = 7 }) {
            zoomer = document.createElement("div");
            zoomer.className = "grid-zoomer";
            zoomer.dataset.cols = String(cols);
            [...stage.children].forEach(child => zoomer.appendChild(child));
            stage.appendChild(zoomer);

            const rng = makeRng(seed);
            const shuffled = () => [...far].sort(() => rng() - 0.5);
            let farQueue = [];
            const centerCol = Math.floor(cols / 2);
            const centerRow = Math.floor(rows / 2);
            let nearIndex = 0;
            farUsed = new Set();
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const dc = c - centerCol;
                    const dr = r - centerRow;
                    if (!dc && !dr) continue;
                    let src;
                    if (Math.max(Math.abs(dc), Math.abs(dr)) <= 2) {
                        src = near[nearIndex++ % near.length];
                    } else {
                        if (!farQueue.length) farQueue = shuffled();
                        src = farQueue.pop();
                        farUsed.add(src);
                    }
                    const tile = document.createElement("div");
                    tile.className = "grid-tile";
                    tile.style.left = `${dc * (W + GAP)}px`;
                    tile.style.top = `${dr * (H + GAP)}px`;
                    tile.style.backgroundImage = `url(${ASSETS}${src})`;
                    zoomer.appendChild(tile);
                }
            }
        },
        async zoomOut(ms) {
            const cols = Number(zoomer.dataset.cols);
            const end = 1 / cols;
            await timeline.animate(ms, p => {
                const eased = 1 - (1 - p) ** 3;
                zoomer.style.transform = `scale(${1 + (end - 1) * eased})`;
            });
        },
        restore() {
            if (!zoomer) return;
            [...zoomer.children].filter(child => !child.classList.contains("grid-tile")).forEach(child => stage.insertBefore(child, zoomer));
            zoomer.remove();
            zoomer = null;
        },
        centerWidth() {
            const scale = Number(stage.dataset.scale) || 1;
            const wallpaper = zoomer.querySelector(".wallpaper");
            return wallpaper.getBoundingClientRect().width / scale;
        },
        farDistinct: () => farUsed.size
    };
}
