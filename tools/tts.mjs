// Final voice lines from ElevenLabs. Writes three takes per line; pick one.
// Usage:
//   ELEVENLABS_API_KEY=… HER_VOICE_ID=… MIA_VOICE_ID=… node tools/tts.mjs [--takes 3]
//   node tools/tts.mjs --pick P2=2,M3=1

import { copyFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { VOICE_LINES } from "../src/javascripts/film/data/story.js";

const VOICE_DIR = fileURLToPath(new URL("../assets/film/voice/", import.meta.url));
// 24 kHz raw PCM is available on every ElevenLabs plan (44.1 kHz needs Pro).
const SAMPLE_RATE = 24000;

export function buildTtsRequest(line, { voiceId, modelId = "eleven_multilingual_v2" }) {
    return {
        url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=pcm_${SAMPLE_RATE}`,
        body: {
            text: line.text,
            model_id: modelId,
            voice_settings: { stability: 0.35, similarity_boost: 0.8, style: 0.2 }
        }
    };
}

export function pcmToWav(pcm, { sampleRate = SAMPLE_RATE } = {}) {
    const header = Buffer.alloc(44);
    header.write("RIFF", 0);
    header.writeUInt32LE(36 + pcm.length, 4);
    header.write("WAVE", 8);
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write("data", 36);
    header.writeUInt32LE(pcm.length, 40);
    return Buffer.concat([header, pcm]);
}

async function generate(takes) {
    const key = process.env.ELEVENLABS_API_KEY;
    const voices = { her: process.env.HER_VOICE_ID, mia: process.env.MIA_VOICE_ID };
    if (!key || !voices.her || !voices.mia) {
        throw new Error("Set ELEVENLABS_API_KEY, HER_VOICE_ID and MIA_VOICE_ID");
    }
    for (const line of VOICE_LINES) {
        for (let take = 1; take <= takes; take++) {
            const { url, body } = buildTtsRequest(line, { voiceId: voices[line.role] });
            const response = await fetch(url, {
                method: "POST",
                headers: { "xi-api-key": key, "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error(`${line.id} take ${take}: ${response.status} ${await response.text()}`);
            const wav = pcmToWav(Buffer.from(await response.arrayBuffer()));
            writeFileSync(`${VOICE_DIR}${line.id}.take${take}.wav`, wav);
            console.log(`${line.id} take ${take}`);
        }
    }
}

function pick(spec) {
    for (const pair of spec.split(",")) {
        const [id, take] = pair.split("=");
        copyFileSync(`${VOICE_DIR}${id}.take${take}.wav`, `${VOICE_DIR}${id}.wav`);
        console.log(`${id} ← take ${take}`);
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const { values } = parseArgs({ options: { takes: { type: "string", default: "3" }, pick: { type: "string" } } });
    if (values.pick) pick(values.pick);
    else await generate(Number(values.takes));
}
