// Synthesised placeholder sounds (16-bit mono WAV). Replace the key clicks with
// a real MacBook recording via tools/slice-keys.mjs when one exists.
// Usage: node tools/synth.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { makeRng } from "../src/javascripts/film/motion.js";

const RATE = 44100;
const OUT = fileURLToPath(new URL("../assets/film/", import.meta.url));

export function encodeWav(samples, sampleRate = RATE) {
    const data = Buffer.alloc(samples.length * 2);
    samples.forEach((value, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, value)) * 32767), i * 2));
    const header = Buffer.alloc(44);
    header.write("RIFF", 0);
    header.writeUInt32LE(36 + data.length, 4);
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
    header.writeUInt32LE(data.length, 40);
    return Buffer.concat([header, data]);
}

function click({ seed, tone, length = 0.06, gain = 0.5, decay = 120 }) {
    const rng = makeRng(seed);
    const samples = new Float32Array(Math.round(RATE * length));
    let previous = 0;
    for (let i = 0; i < samples.length; i++) {
        const t = i / RATE;
        const noise = rng() * 2 - 1;
        previous = previous * 0.6 + noise * 0.4;
        const body = Math.sin(2 * Math.PI * tone * t) * 0.5 + previous;
        samples[i] = body * gain * Math.exp(-t * decay);
    }
    return samples;
}

function loop(seconds, fn) {
    const samples = new Float32Array(Math.round(RATE * seconds));
    for (let i = 0; i < samples.length; i++) samples[i] = fn(i / RATE, i);
    return samples;
}

function musicBox() {
    // Eight bars of a C-major lullaby at 72 BPM, two beats per note.
    const melody = [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 83, 79, 74, 71];
    const beat = 60 / 72;
    const seconds = melody.length * beat;
    return loop(seconds, t => {
        const index = Math.floor(t / beat);
        const local = t - index * beat;
        const freq = 440 * 2 ** ((melody[index] - 69) / 12);
        const env = Math.exp(-local * 3.2);
        return 0.25 * env * (Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(4 * Math.PI * freq * t) + 0.12 * Math.sin(6 * Math.PI * freq * t));
    });
}

export function synthesizeAll(out = OUT) {
    mkdirSync(`${out}sfx`, { recursive: true });
    mkdirSync(`${out}post`, { recursive: true });
    const write = (path, samples) => writeFileSync(`${out}${path}`, encodeWav(samples));

    [1900, 2300, 1700, 2600, 2100, 1800, 2450, 2000].forEach((tone, i) => {
        write(`sfx/key${i + 1}.wav`, click({ seed: i + 11, tone, gain: 0.35 + 0.05 * (i % 3) }));
    });
    write("sfx/space.wav", click({ seed: 31, tone: 900, length: 0.09, gain: 0.45, decay: 70 }));
    write("sfx/return.wav", click({ seed: 41, tone: 1200, length: 0.09, gain: 0.5, decay: 80 }));
    write("sfx/click.wav", click({ seed: 51, tone: 3200, length: 0.03, gain: 0.3, decay: 260 }));
    write("sfx/toggle.wav", click({ seed: 61, tone: 1500, length: 0.05, gain: 0.55, decay: 180 }));

    const rng = makeRng(71);
    let brown = 0;
    write("post/roomtone.wav", loop(60, t => {
        brown = Math.max(-1, Math.min(1, brown + (rng() * 2 - 1) * 0.02)) * 0.998;
        return brown * 0.25 + Math.sin(2 * Math.PI * 60 * t) * 0.01;
    }));
    write("post/drone.wav", loop(60, t => 0.3 * Math.sin(2 * Math.PI * 45 * t) + 0.25 * Math.sin(2 * Math.PI * 52 * t)));
    write("post/on-repeat-loop.wav", musicBox());
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    synthesizeAll();
    console.log(`Synthesised sounds in ${OUT}`);
}
