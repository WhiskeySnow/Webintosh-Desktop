// Beat log → Premiere markers (FCP7 XML) and a Markdown timecode table.
// Usage: node tools/markers.mjs <log.json> <out-dir>

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { SHOTS } from "../src/javascripts/film/data/story.js";

const pad = n => String(n).padStart(2, "0");
const escapeXml = text => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function timecode(frame, fps) {
    const seconds = Math.floor(frame / fps);
    return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}:${pad(frame % fps)}`;
}

export function toMarkers(log, { fps = 30 } = {}) {
    return log.filter(entry => entry.beat !== "end").map(({ scene, beat, t }) => {
        const frame = Math.round(t / 1000 * fps);
        const shot = SHOTS[scene]?.[beat];
        return { name: `${scene} · ${beat}${shot ? ` — ${shot}` : ""}`, frame, timecode: timecode(frame, fps) };
    });
}

export function toFcpXml(markers, { fps = 30, name = "VOLI markers" } = {}) {
    const rate = `<rate><timebase>${fps}</timebase><ntsc>FALSE</ntsc></rate>`;
    const duration = (markers.at(-1)?.frame ?? 0) + fps * 5;
    const body = markers.map(m => `    <marker><name>${escapeXml(m.name)}</name><comment></comment><in>${m.frame}</in><out>-1</out></marker>`).join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="5">
  <sequence>
    <name>${escapeXml(name)}</name>
    <duration>${duration}</duration>
    ${rate}
    <timecode>${rate}<string>00:00:00:00</string><frame>0</frame><displayformat>NDF</displayformat></timecode>
    <media>
      <video><format><samplecharacteristics>${rate}<width>1920</width><height>1080</height><pixelaspectratio>square</pixelaspectratio></samplecharacteristics></format><track/></video>
      <audio><track/></audio>
    </media>
${body}
  </sequence>
</xmeml>
`;
}

export function toMarkdown(markers) {
    return ["| 时间码 | 场景 · 节拍 — 镜头 |", "|---|---|", ...markers.map(m => `| ${m.timecode} | ${m.name} |`)].join("\n") + "\n";
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const [logPath, outDir] = process.argv.slice(2);
    const markers = toMarkers(JSON.parse(readFileSync(logPath, "utf8")));
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "markers.xml"), toFcpXml(markers));
    writeFileSync(join(outDir, "markers.md"), toMarkdown(markers));
    console.log(`${markers.length} markers → ${outDir}`);
}
