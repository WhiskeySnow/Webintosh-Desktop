// Test-only scenes, run with ?dev=<name>. Never part of the film.

function inputFixture(stage) {
    stage.insertAdjacentHTML("beforeend", `
        <button id="dev-a" style="position:absolute;left:300px;top:300px;width:160px;height:60px">A</button>
        <button id="dev-b" style="position:absolute;left:1400px;top:700px;width:160px;height:60px">B</button>
        <input id="dev-input" style="position:absolute;left:700px;top:500px;width:400px;height:32px">`);
    const counts = { a: 0, b: 0 };
    stage.querySelector("#dev-a").addEventListener("click", () => counts.a++);
    stage.querySelector("#dev-b").addEventListener("click", () => counts.b++);
    return counts;
}

const countSounds = (film, pattern, from) => film.audioLog.slice(from).filter(entry => pattern.test(entry.id)).length;

export const devScenes = {
    "dev-anchors": {
        id: "dev-anchors",
        async run(ctx) {
            await ctx.at(1000);
            ctx.beat("a");
            await ctx.wait(600);
            ctx.beat("b");
            await ctx.at(1200);
            ctx.beat("c");
        }
    },
    "dev-input": {
        id: "dev-input",
        async run({ stage, cursor, keyboard, sound, film, timeline }) {
            const counts = inputFixture(stage);
            const results = film.results = {};

            await cursor.moveTo("#dev-a", { mode: "human" });
            await cursor.click({ mode: "human" });
            results.clicksA = counts.a;
            results.clickSoundsAfterHuman = countSounds(film, /^click$/, 0);

            await cursor.moveTo("#dev-b", { mode: "machine" });
            await cursor.click({ mode: "machine" });
            results.clicksB = counts.b;
            results.clickSoundsAfterMachine = countSounds(film, /^click$/, 0);

            await cursor.moveTo({ x: 200, y: 900 }, { mode: "machine" });
            const start = { ...cursor.pos };
            const b = stage.querySelector("#dev-b").getBoundingClientRect();
            const scale = Number(stage.dataset.scale);
            const s = stage.getBoundingClientRect();
            const end = { x: (b.left - s.left + b.width / 2) / scale, y: (b.top - s.top + b.height / 2) / scale };
            await cursor.moveTo("#dev-b", { mode: "human", until: 0.7 });
            const along = (cursor.pos.x - start.x) * (end.x - start.x) + (cursor.pos.y - start.y) * (end.y - start.y);
            results.untilFraction = along / ((end.x - start.x) ** 2 + (end.y - start.y) ** 2);

            const input = stage.querySelector("#dev-input");
            let mark = film.audioLog.length;
            await keyboard.type(input, ["no keep it"], { mode: "machine" });
            results.machineValue = input.value;
            results.keySoundsDuringMachine = countSounds(film, /^(key\d|space|return)$/, mark);

            input.value = "";
            mark = film.audioLog.length;
            const began = timeline.t;
            await keyboard.type(input, ["what is it?"], { mode: "human", voice: "P2" });
            results.humanElapsed = timeline.t - began;
            results.p2Duration = sound.duration("P2");
            results.humanValue = input.value;
            results.p2Played = film.audioLog.slice(mark).some(entry => entry.id === "P2");
            results.keySoundsDuringHuman = countSounds(film, /^(key\d|space)$/, mark);
        }
    },
    "dev-sound": {
        id: "dev-sound",
        async run(ctx) {
            ctx.sound.play("key1");
            await ctx.wait(100);
            ctx.sound.play("send");
        }
    },
    "dev-sound-missing": {
        id: "dev-sound-missing",
        async run(ctx) {
            await ctx.sound.load({ voice: { MISSING: { path: "voice/MISSING.wav", text: "0123456789" } } });
        }
    }
};
