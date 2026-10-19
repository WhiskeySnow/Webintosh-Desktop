// Sound files, by id, relative to assets/film/.

import { VOICE_LINES } from "./story.js";

const SFX_IDS = [
    "key1", "key2", "key3", "key4", "key5", "key6", "key7", "key8",
    "space", "return", "click", "send", "receive", "notify", "finderError", "toggle"
];

export const manifest = {
    voice: Object.fromEntries(VOICE_LINES.map(line => [line.id, { path: `voice/${line.id}.wav`, text: line.text }])),
    sfx: Object.fromEntries(SFX_IDS.map(id => [id, `sfx/${id}.wav`]))
};
