// Web Audio playback for everything that comes out of the computer:
// voices, keys, clicks and system sounds. VOLI itself never plays anything.

const ESTIMATE_MS_PER_CHAR = 60;
const FADE_S = 0.01;

export function createSound({ audio, timeline, film, base = "assets/film/" }) {
    const buffers = new Map();
    const texts = new Map();
    let speaking = null;

    async function loadOne(id, path) {
        try {
            const response = await fetch(base + path);
            if (!response.ok) throw new Error(String(response.status));
            buffers.set(id, await audio.decodeAudioData(await response.arrayBuffer()));
        } catch {
            film.errors.push(`missing:${id}`);
        }
    }

    function duration(id) {
        const buffer = buffers.get(id);
        if (buffer) return buffer.duration * 1000;
        return (texts.get(id)?.length ?? 0) * ESTIMATE_MS_PER_CHAR;
    }

    return {
        async load({ voice = {}, sfx = {} }) {
            const jobs = [];
            for (const [id, { path, text }] of Object.entries(voice)) {
                texts.set(id, text);
                jobs.push(loadOne(id, path));
            }
            for (const [id, path] of Object.entries(sfx)) {
                jobs.push(loadOne(id, path));
            }
            await Promise.all(jobs);
        },
        duration,
        cutDuration: (id, cutAt) => duration(id) * cutAt,
        // The voice line still playing at the scheduled time, if any.
        speaking: () => (speaking && speaking.end > timeline.cursor ? speaking : null),
        play(id, { gain = 1, cutAt } = {}) {
            film.audioLog.push({ t: Math.round(timeline.cursor), id });
            if (texts.has(id)) {
                const current = speaking && speaking.end > timeline.cursor ? speaking : null;
                if (current) {
                    film.overruns.push({ ...film.current, kind: "voice-overlap", id, ms: Math.round(current.end - timeline.cursor) });
                }
                speaking = { id, end: timeline.cursor + (cutAt ? duration(id) * cutAt : duration(id)) };
            }
            const buffer = buffers.get(id);
            if (!buffer) return;
            const source = audio.createBufferSource();
            const level = audio.createGain();
            source.buffer = buffer;
            level.gain.value = gain;
            source.connect(level).connect(audio.destination);
            const now = audio.currentTime;
            source.start(now);
            if (cutAt) {
                const stopAt = now + buffer.duration * cutAt;
                level.gain.setValueAtTime(gain, stopAt - FADE_S);
                level.gain.linearRampToValueAtTime(0, stopAt);
                source.stop(stopAt + 0.005);
            }
        }
    };
}
