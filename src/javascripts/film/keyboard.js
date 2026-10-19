// Types into inputs or text elements. Her typing plays her voice line and a
// key sound per stroke; VOLI's typing makes no sound at all.

import { planTyping } from "./typing.js";

const KEYS = ["key1", "key2", "key3", "key4", "key5", "key6", "key7", "key8"];

export function createKeyboard({ timeline, sound }) {
    let next = 0;

    function keySound(char) {
        if (char === " ") return "space";
        if (char === "\n") return "return";
        const id = KEYS[next % KEYS.length];
        next++;
        return id;
    }

    return {
        async type(target, ops, { mode = "human", voice, cutAt, seed = 1 } = {}) {
            const isField = "value" in target && target.tagName !== "BUTTON";
            const read = () => (isField ? target.value : target.textContent);
            const write = text => {
                if (isField) target.value = text;
                else target.textContent = text;
                target.dispatchEvent(new Event("input", { bubbles: true }));
            };

            let durationMs;
            if (mode === "human" && voice) {
                durationMs = cutAt ? sound.cutDuration(voice, cutAt) : sound.duration(voice);
                sound.play(voice, { cutAt });
            }
            const plan = planTyping(ops, { mode, durationMs, seed });
            const start = timeline.cursor;
            for (const event of plan) {
                await timeline.until(start + event.t);
                const text = read();
                write(event.op === "insert" ? text + event.char : text.slice(0, -1));
                if (mode === "human") {
                    sound.play(event.op === "insert" ? keySound(event.char) : keySound("x"));
                }
            }
        }
    };
}
