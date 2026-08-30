#!/usr/bin/env bash
# Re-encodes a video for use in a gallery album: H.264 + yuv420p + AAC +
# faststart, the combination that plays reliably in the gallery grid across
# desktop browsers and iPhone/Safari (see git history for the moov-atom
# rendering bug this avoids). Works on any input ffmpeg can read (mov, mp4,
# etc.) - if input isn't itself named *.mp4, the output is a sibling .mp4
# file and the original is left in place.
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $(basename "$0") <video-file>" >&2
  exit 1
fi

in="$1"
if [ ! -f "$in" ]; then
  echo "File not found: $in" >&2
  exit 1
fi

dir=$(dirname "$in")
base=$(basename "$in")
name="${base%.*}"
out="$dir/$name.mp4"
tmp="$dir/$name.prep-tmp.mp4"
poster="$dir/$name.poster.jpg"

ffmpeg -y -i "$in" -c:v libx264 -pix_fmt yuv420p -c:a aac -movflags +faststart "$tmp"
mv "$tmp" "$out"

# A real poster frame, not a browser-decoded preview (see layouts/partials/gallery.html) -
# the latter is what rendered as a solid black square on Safari/iOS.
ffmpeg -y -ss 0.1 -i "$out" -frames:v 1 -q:v 3 "$poster"

echo "Wrote $out"
echo "Wrote $poster"
if [ "$in" != "$out" ]; then
  echo "Original left in place: $in (delete it once you've checked $out looks right)"
fi
