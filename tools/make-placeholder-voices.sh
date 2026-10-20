#!/bin/bash
# Placeholder voice lines from macOS `say`, until the AI voices exist.
# The texts match VOICE_LINES in src/javascripts/film/data/story.js.
set -euo pipefail

OUT="$(cd "$(dirname "$0")/.." && pwd)/assets/film/voice"
mkdir -p "$OUT"
TMP="$(mktemp -d)"

line() {
    local id="$1" voice="$2" rate="$3" text="$4"
    say -v "$voice" -r "$rate" -o "$TMP/$id.aiff" "$text"
    afconvert -f WAVE -d LEI16@44100 "$TMP/$id.aiff" "$OUT/$id.wav"
}

line P1a Samantha 150 "I just"
line P1b Samantha 140 "I just..."
line P2 Samantha 165 "what is it?"
line P3 Samantha 165 "send it lol"
line P4 Samantha 165 "kinda this is weird"
line P5 Samantha 165 "yeah delete"
line M1 Karen 185 "you need to try this lol"
line M2 Karen 185 "this weird app i found"
line M3 Karen 195 "it asks you random stuff and then guesses what you're gonna pick"
line M4 Karen 185 "it's lowkey way too accurate"
line M5 Karen 185 "tell me if it gets you right lol"
line M6 Karen 185 "did it get you right??"
line M7 Karen 170 "wait"
line M8 Karen 185 "should i delete it lol"

rm -rf "$TMP"
echo "Placeholder voices written to $OUT"
