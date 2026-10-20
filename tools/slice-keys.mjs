// Cuts a phone recording of real MacBook typing into the eight key sounds.
// Usage: node tools/slice-keys.mjs <recording.wav>

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { encodeWav } from "./synth.mjs";

const OUT = fileURLToPath(new URL("../assets/film/sfx/", import.meta.url));

export function sliceKeys(samples, sampleRate, { count = 8, length = 0.12, minGap = 0.08, fade = 0.005, preroll = 0.003 } = {}) {
    const frame = Math.max(1, Math.round(sampleRate / 1000));
    const frames = Math.floor(samples.length / frame);
    const energy = new Float64Array(frames);
    for (let f = 0; f < frames; f++) {
        let sum = 0;
        for (let i = f * frame; i < (f + 1) * frame; i++) sum += samples[i] * samples[i];
        energy[f] = sum;
    }
    const gapFrames = Math.round(minGap * 1000);
    const peaks = [];
    for (let f = 0; f < frames; f++) {
        if (energy[f] <= 0) continue;
        let isPeak = true;
        for (let g = Math.max(0, f - gapFrames); g <= Math.min(frames - 1, f + gapFrames); g++) {
            if (energy[g] > energy[f] || (energy[g] === energy[f] && g < f)) {
                isPeak = false;
                break;
            }
        }
        if (isPeak) peaks.push(f);
    }
    const chosen = peaks.sort((a, b) => energy[b] - energy[a]).slice(0, count);
    const size = Math.round(length * sampleRate);
    const fadeSize = Math.round(fade * sampleRate);
    return chosen.map(f => {
        const start = Math.max(0, f * frame - Math.round(preroll * sampleRate));
        const slice = new Float32Array(size);
        slice.set(samples.subarray(start, start + size));
        for (let i = 0; i < fadeSize; i++) {
            slice[i] *= i / fadeSize;
            slice[size - 1 - i] *= i / fadeSize;
        }
        return { at: (f * frame) / sampleRate, samples: slice };
    });
}

function readWav(path) {
    const data = readFileSync(path);
    let offset = 12;
    let channels = 1;
    let sampleRate = 44100;
    while (offset < data.length) {
        const id = data.toString("ascii", offset, offset + 4);
        const size = data.readUInt32LE(offset + 4);
        if (id === "fmt ") {
            channels = data.readUInt16LE(offset + 10);
            sampleRate = data.readUInt32LE(offset + 12);
        } else if (id === "data") {
            const count = size / 2 / channels;
            const samples = new Float32Array(count);
            for (let i = 0; i < count; i++) samples[i] = data.readInt16LE(offset + 8 + i * 2 * channels) / 32768;
            return { samples, sampleRate };
        }
        offset += 8 + size + (size % 2);
    }
    throw new Error("No PCM data found (export the recording as 16-bit WAV)");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const { samples, sampleRate } = readWav(process.argv[2]);
    sliceKeys(samples, sampleRate)
        .sort((a, b) => a.at - b.at)
        .forEach((slice, i) => writeFileSync(`${OUT}key${i + 1}.wav`, encodeWav(slice.samples, sampleRate)));
    console.log(`Wrote key1–key8 to ${OUT}`);
}
