#!/usr/bin/env bash
#
# design-proposal-kit: stack one direction from its bundle inbox
#
# Phase 2 entry point. After you have generated the images in your image chat
# and dropped them into the bundle's images/ folder, this turns them into one
# continuous page.
#
# Expects:
#   bundles/<slug>/images/1-hero.png
#   bundles/<slug>/images/2-<whatever>.png
#   bundles/<slug>/images/3-<whatever>.png
#
# Files are stacked in filename order, so the leading number decides the
# sequence. 1 is the hero and keeps its navigation.
#
# Usage:
#   ./scripts/stack-direction.sh bundles/warm-and-playful
#   ./scripts/stack-direction.sh -c 72 bundles/warm-and-playful
#   ./scripts/stack-direction.sh -o custom/path.png bundles/warm-and-playful
#
#   -c  pixels to crop off the top of every image after the first, to remove the
#       repeated navigation. Default 0. Measure it first:
#         ./scripts/stack-sections.sh -m bundles/<slug>/images/2-*.png
#   -o  output file. Default: stacked/<slug>-full.png next to the bundles/ dir.

set -euo pipefail

CROP=0
OUT=""

while getopts "c:o:h" opt; do
  case "$opt" in
    c) CROP="$OPTARG" ;;
    o) OUT="$OPTARG" ;;
    h) sed -n '2,26p' "$0"; exit 0 ;;
    *) echo "Unknown option. Run with -h." >&2; exit 1 ;;
  esac
done
shift $((OPTIND - 1))

BUNDLE="${1:-}"
if [[ -z "$BUNDLE" ]]; then
  echo "Give a bundle directory, e.g. bundles/warm-and-playful. Run with -h." >&2
  exit 1
fi
BUNDLE="${BUNDLE%/}"

if [[ ! -d "$BUNDLE" ]]; then
  echo "No such bundle: $BUNDLE" >&2
  exit 1
fi

INBOX="$BUNDLE/images"
if [[ ! -d "$INBOX" ]]; then
  echo "No images/ folder in $BUNDLE." >&2
  echo "That is the inbox: drop the images from your chat into $INBOX first." >&2
  exit 1
fi

# Collect images in filename order. The leading number is the sequence.
shopt -s nullglob
FILES=()
for f in "$INBOX"/*.png "$INBOX"/*.PNG "$INBOX"/*.jpg "$INBOX"/*.jpeg "$INBOX"/*.webp; do
  FILES+=("$f")
done
shopt -u nullglob

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "$INBOX is empty." >&2
  echo "Generate the images first, then drop them in there named 1-hero.png, 2-..., 3-..." >&2
  exit 1
fi
if [[ ${#FILES[@]} -lt 2 ]]; then
  echo "Only one image in $INBOX. A direction needs at least a hero plus one section." >&2
  exit 1
fi

# Sort so 2- comes before 10-, not after.
IFS=$'\n' SORTED=($(printf '%s\n' "${FILES[@]}" | sort -V)); unset IFS

SLUG=$(basename "$BUNDLE")
if [[ -z "$OUT" ]]; then
  PARENT=$(dirname "$BUNDLE")
  OUT="$(dirname "$PARENT")/stacked/${SLUG}-full.png"
  [[ "$PARENT" == "." ]] && OUT="stacked/${SLUG}-full.png"
fi
mkdir -p "$(dirname "$OUT")"

echo "Direction : $SLUG"
echo "Images    : ${#SORTED[@]} found, stacking in this order:"
for f in "${SORTED[@]}"; do
  echo "            $(basename "$f")"
done
[[ "$CROP" -gt 0 ]] && echo "Crop      : ${CROP}px off everything after the first"
echo

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$HERE/stack-sections.sh" -o "$OUT" -c "$CROP" "${SORTED[@]}"

echo
echo "Next: look at $OUT before you build the PDF."
echo "If a section starts with half a navigation bar, measure and re-run with -c."
