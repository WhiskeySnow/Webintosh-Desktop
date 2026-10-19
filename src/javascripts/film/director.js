// Runs scenes in order against the shared timeline and keeps the beat log
// that the checks and the Premiere markers are built from.

import { SCENES, TIMELINE } from "./data/story.js";

export function createDirector({ timeline, film, makeCtx }) {
    let current = { scene: null, beat: null };

    function beat(scene, name) {
        current = { scene, beat: name };
        film.log.push({ scene, beat: name, t: Math.round(timeline.cursor), actual: Math.round(timeline.t) });
    }

    async function play(entries) {
        for (const [index, { module, targetMs, world }] of entries.entries()) {
            const sceneStart = timeline.cursor;
            const ctx = {
                ...makeCtx(module),
                beat: name => beat(module.id, name),
                wait: ms => timeline.wait(ms),
                async at(ms) {
                    const target = sceneStart + ms;
                    if (timeline.cursor > target) {
                        film.overruns.push({ scene: module.id, beat: current.beat, ms: Math.round(timeline.cursor - target) });
                    }
                    await timeline.until(target);
                }
            };
            if (index === 0 && module.setup) {
                await module.setup(ctx);
            }
            if (index === 0 && ctx.snapshot) {
                film.setupSnapshot = ctx.snapshot();
            }
            if (world) {
                ctx.world.set(world);
            }
            ctx.beat("start");
            await module.run(ctx);
            if (targetMs) {
                await ctx.at(targetMs);
            }
            ctx.beat("end");
            if (ctx.snapshot) {
                film.endSnapshot = ctx.snapshot();
            }
        }
    }

    return {
        current: () => current,
        async run({ scenes, scene, dev, devScenes }) {
            let entries;
            if (dev) {
                const module = devScenes[dev];
                if (!module) throw new Error(`Unknown dev scene "${dev}"`);
                entries = [{ module, targetMs: module.targetMs }];
            } else if (scene !== null) {
                const module = scenes[scene];
                if (!module) throw new Error(`Scene ${scene} is not built yet`);
                entries = [{ module, targetMs: SCENES[scene].targetMs, world: TIMELINE[scene] }];
            } else {
                entries = scenes.map((module, i) => ({ module, targetMs: SCENES[i].targetMs, world: TIMELINE[i] }));
            }
            await play(entries);
            film.done = true;
        }
    };
}
