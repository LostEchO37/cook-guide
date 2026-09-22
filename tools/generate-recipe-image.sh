#!/bin/bash
# Generate one recipe hero image via Image Playground UI automation.
# Usage: ./tools/generate-recipe-image.sh <output.png> "<prompt>"

set -euo pipefail

OUT="${1:?output path required}"
PROMPT="${2:?prompt required}"
TMP="${OUT%.png}.raw.png"

mkdir -p "$(dirname "$OUT")"

# Ensure we're on the new-image prompt screen.
osascript <<'APPLESCRIPT' >/dev/null 2>&1 || true
tell application "Image Playground" to activate
delay 0.4
tell application "System Events" to tell process "Image Playground"
  set frontmost to true
  try
    click menu item "New Image" of menu "File" of menu bar 1
  end try
end tell
APPLESCRIPT
sleep 1.2

read -r WIN_X WIN_Y WIN_W WIN_H <<EOF
$(osascript <<'APPLESCRIPT'
tell application "System Events" to tell process "Image Playground"
  set p to position of window 1
  set s to size of window 1
  return (item 1 of p as text) & " " & (item 2 of p as text) & " " & (item 1 of s as text) & " " & (item 2 of s as text)
end tell
APPLESCRIPT
)
EOF

PROMPT_X=$((WIN_X + WIN_W * 55 / 100))
PROMPT_Y=$((WIN_Y + WIN_H * 48 / 100))

osascript <<EOF
tell application "Image Playground" to activate
delay 0.3
tell application "System Events" to tell process "Image Playground"
  set frontmost to true
  click at {$PROMPT_X, $PROMPT_Y}
  delay 0.5
  keystroke "a" using command down
  keystroke "$PROMPT"
  delay 0.5
  keystroke return
end tell
EOF

echo "Generating: $(basename "$OUT") ..."
sleep 34

read -r WIN_X WIN_Y WIN_W WIN_H <<EOF
$(osascript <<'APPLESCRIPT'
tell application "System Events" to tell process "Image Playground"
  set p to position of window 1
  set s to size of window 1
  return (item 1 of p as text) & " " & (item 2 of p as text) & " " & (item 1 of s as text) & " " & (item 2 of s as text)
end tell
APPLESCRIPT
)
EOF

# Capture the large preview card (left/center of window after generation).
CAP_X=$((WIN_X + WIN_W * 18 / 100))
CAP_Y=$((WIN_Y + WIN_H * 16 / 100))
CAP_W=$((WIN_W * 52 / 100))
CAP_H=$((WIN_H * 64 / 100))

screencapture -x -R"${CAP_X},${CAP_Y},${CAP_W},${CAP_H}" "$TMP"
sips -c 860 860 --cropOffset 90 70 "$TMP" --out "$OUT" >/dev/null
rm -f "$TMP"

python3 - <<PY
from PIL import Image
path = "$OUT"
im = Image.open(path).convert('RGB')
w, h = im.size
left = 0
for x in range(min(50, w)):
    col = list(im.crop((x, 0, x + 1, h)).getdata())
    avg = sum(sum(p) for p in col) / (len(col) * 3)
    if avg < 210:
        left = x
        break
if left > 0:
    im = im.crop((left, 0, w, h))
    side = max(im.size)
    square = Image.new('RGB', (side, side), (200, 180, 160))
    square.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    im = square
    im.save(path, optimize=True)
print(path)
PY

echo "Saved $OUT"
