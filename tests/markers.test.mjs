import test from "node:test";
import assert from "node:assert/strict";
import { toMarkers, toFcpXml, toMarkdown } from "../tools/markers.mjs";

test("markers convert beat times to 30fps frames and timecode, with the shot note", () => {
    const [marker] = toMarkers([{ scene: "03-questions", beat: "q4-hover", t: 61500 }]);
    assert.equal(marker.frame, 1845);
    assert.equal(marker.timecode, "00:01:01:15");
    assert.match(marker.name, /^03-questions · q4-hover — .*推到 200%/);
});

test("end beats are not markers", () => {
    assert.equal(toMarkers([{ scene: "00-cold-open", beat: "end", t: 25000 }]).length, 0);
});

test("FCP7 XML carries one marker per beat at 30fps", () => {
    const markers = toMarkers([
        { scene: "00-cold-open", beat: "start", t: 0 },
        { scene: "00-cold-open", beat: "mia-notify", t: 22000 },
        { scene: "01-mia", beat: "link & card", t: 46000 }
    ]);
    const xml = toFcpXml(markers);
    assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
    assert.match(xml, /<rate><timebase>30<\/timebase><ntsc>FALSE<\/ntsc><\/rate>/);
    assert.equal(xml.match(/<marker>/g).length, 3);
    assert.match(xml, /<in>660<\/in><out>-1<\/out>/);
    assert.match(xml, /link &amp; card/);
    assert.doesNotMatch(xml, /link & card/);
});

test("markdown table lists timecode and name", () => {
    const md = toMarkdown(toMarkers([{ scene: "00-cold-open", beat: "mia-notify", t: 22000 }]));
    assert.match(md, /\| 时间码 \| 场景 · 节拍 — 镜头 \|/);
    assert.match(md, /\| 00:00:22:00 \| 00-cold-open · mia-notify/);
});
