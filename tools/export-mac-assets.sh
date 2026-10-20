#!/bin/bash
# Exports icons, wallpaper thumbnails and system sounds from this Mac into
# assets/film/, and copies the approved mockup assets. Safe to re-run.
# Apple's icons and sounds are used for a class project only.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/assets/film"
MOCK="$ROOT/docs/superpowers/specs/screenlife-film-mockups/assets"
CORE=/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources
SYS=/System/Library/Components/CoreAudio.component/Contents/SharedSupport/SystemSounds
TONES=/System/Library/PrivateFrameworks/ToneLibrary.framework/Versions/A/Resources/AlertTones
mkdir -p "$OUT"/{icons,thumbs,avatars,wallpapers/others,sfx,voice,post,grid}

icon() { sips -s format png -Z 256 "$1" --out "$OUT/icons/$2.png" >/dev/null; }

app_icon() {
    local name="$1" app="$2" file
    file=$(defaults read "$app/Contents/Info" CFBundleIconFile 2>/dev/null || echo AppIcon)
    file="${file%.icns}.icns"
    if [ -f "$app/Contents/Resources/$file" ]; then
        icon "$app/Contents/Resources/$file" "$name"
    else
        icon "$CORE/GenericApplicationIcon.icns" "$name"
    fi
}

app_icon finder /System/Library/CoreServices/Finder.app
app_icon launchpad /System/Applications/Launchpad.app
app_icon safari /Applications/Safari.app
app_icon messages /System/Applications/Messages.app
app_icon mail /System/Applications/Mail.app
app_icon photos /System/Applications/Photos.app
app_icon notes /System/Applications/Notes.app
app_icon music /System/Applications/Music.app
app_icon pages /Applications/Pages.app
app_icon stickies /System/Applications/Stickies.app
app_icon preview /System/Applications/Preview.app
app_icon settings "/System/Applications/System Settings.app"
app_icon calendar /System/Applications/Calendar.app
app_icon raycast /Applications/Raycast.app
app_icon zoom /Applications/zoom.us.app
icon "$CORE/GenericFolderIcon.icns" folder
icon "$CORE/DownloadsFolder.icns" downloads
icon "$CORE/ApplicationsFolderIcon.icns" applications
icon "$CORE/GenericDocumentIcon.icns" generic-doc
icon "$CORE/GenericApplicationIcon.icns" generic-app
cp /System/Library/CoreServices/Dock.app/Contents/Resources/trashfull@2x.png "$OUT/icons/trash.png"
cp /System/Library/CoreServices/Dock.app/Contents/Resources/trashempty@2x.png "$OUT/icons/trash-empty.png"

i=0
for f in "/System/Library/Desktop Pictures/.thumbnails/"*.heic; do
    i=$((i + 1))
    sips -s format jpeg "$f" --out "$OUT/wallpapers/others/other-$(printf %02d $i).jpg" >/dev/null
    [ $i -ge 16 ] && break
done

cp "$MOCK"/th-*.png "$OUT/thumbs/"
cp "$MOCK"/av-*.jpg "$OUT/avatars/"
cp "$MOCK/v2-wall.jpg" "$OUT/wallpapers/her.jpg"
cp "$MOCK/voli-icon.svg" "$OUT/icons/voli.svg"

wav() { afconvert -f WAVE -d LEI16@44100 "$1" "$OUT/sfx/$2.wav"; }
wav "$SYS/system/SentMessage.caf" send
if [ -f "$TONES/ReceivedMessage.caf" ]; then wav "$TONES/ReceivedMessage.caf" receive; else wav /System/Library/Sounds/Tink.aiff receive; fi
wav /System/Library/Sounds/Glass.aiff notify
wav /System/Library/Sounds/Funk.aiff finderError

echo "Exported to $OUT"
