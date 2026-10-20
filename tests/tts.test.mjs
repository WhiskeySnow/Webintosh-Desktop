import test from "node:test";
import assert from "node:assert/strict";
import { buildTtsRequest, pcmToWav } from "../tools/tts.mjs";

test("ElevenLabs request asks for raw 24kHz PCM (available below the Pro plan) with the line's text", () => {
    const { url, body } = buildTtsRequest({ id: "P2", text: "what is it?" }, { voiceId: "abc123" });
    assert.equal(url, "https://api.elevenlabs.io/v1/text-to-speech/abc123?output_format=pcm_24000");
    assert.equal(body.text, "what is it?");
    assert.equal(body.model_id, "eleven_multilingual_v2");
    assert.deepEqual(body.voice_settings, { stability: 0.35, similarity_boost: 0.8, style: 0.2 });
});

test("raw PCM becomes a playable 16-bit mono WAV", () => {
    const pcm = Buffer.alloc(441 * 2, 1);
    const wav = pcmToWav(pcm);
    assert.equal(wav.toString("ascii", 0, 4), "RIFF");
    assert.equal(wav.toString("ascii", 8, 12), "WAVE");
    assert.equal(wav.readUInt32LE(24), 24000);
    assert.equal(wav.readUInt32LE(40), pcm.length);
    assert.equal(wav.length, 44 + pcm.length);
});
