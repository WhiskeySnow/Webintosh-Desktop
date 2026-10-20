import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const realTime = /new Date\(\s*\)|Date\.now\(/;

function findRealTimeUses(dir) {
    const hits = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
            hits.push(...findRealTimeUses(path));
        } else if (entry.name.endsWith(".js") && realTime.test(readFileSync(path, "utf8"))) {
            hits.push(path);
        }
    }
    return hits;
}

test("the scanner catches a real-time call", () => {
    const dir = mkdtempSync(join(tmpdir(), "film-scan-"));
    writeFileSync(join(dir, "leak.js"), "const now = Date.now();\n");
    assert.equal(findRealTimeUses(dir).length, 1);
});

test("film code never reads the real clock", () => {
    const hits = findRealTimeUses(fileURLToPath(new URL("../src/javascripts/film", import.meta.url)));
    assert.deepEqual(hits, [], `real time used in: ${hits.join(", ")}`);
});
