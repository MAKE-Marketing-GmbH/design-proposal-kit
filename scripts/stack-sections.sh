#!/usr/bin/env bash
#
# design-proposal-kit: stack section mockups into one continuous page
#
# The generated sections each tend to carry their own navigation bar. Stacked
# raw, you get a page with the nav repeated five times, which instantly reads
# as fake. This crops the repeated nav off every section after the first and
# appends them into one tall image.
#
# Usage:
#   ./scripts/stack-sections.sh -o out.png [-c 72] hero.png sec2.png sec3.png
#
#   -o  output file (required)
#   -c  pixels to crop off the top of every section after the first.
#       Default 0. Find the right number with: ./scripts/stack-sections.sh -m sec2.png
#   -m  measure mode: writes a ruler overlay so you can read the nav height,
#       then exits without stacking.
#
# Requires ImageMagick 7 (`magick`).

set -euo pipefail

OUT=""
CROP=0
MEASURE=""

while getopts "o:c:m:h" opt; do
  case "$opt" in
    o) OUT="$OPTARG" ;;
    c) CROP="$OPTARG" ;;
    m) MEASURE="$OPTARG" ;;
    h) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "Unknown option. Run with -h." >&2; exit 1 ;;
  esac
done
shift $((OPTIND - 1))

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick 7 is required (command: magick)." >&2
  exit 1
fi

# Validate -c early. Left unchecked, "-c abc" evaluates to 0 in bash arithmetic
# and would silently crop nothing at all.
if ! [[ "$CROP" =~ ^[0-9]+$ ]]; then
  echo "-c takes a plain number of pixels, got: $CROP" >&2
  echo "Measure it with: $0 -m <section.png>" >&2
  exit 1
fi

# --- measure mode ---------------------------------------------------------
if [[ -n "$MEASURE" ]]; then
  if [[ ! -f "$MEASURE" ]]; then
    echo "File not found: $MEASURE" >&2
    exit 1
  fi
  W=$(magick identify -format "%w" "$MEASURE")
  RULER="${MEASURE%.*}-ruler.png"

  # Graduated ticks, no text. ImageMagick's text drawing needs a configured
  # font, and plenty of installs have none, so numbers are not an option here.
  # Instead: full-width line every 100px, long tick every 50, short every 10.
  MINOR=""
  MID=""
  MAJOR=""
  for y in $(seq 10 10 240); do
    if   (( y % 100 == 0 )); then MAJOR="$MAJOR line 0,$y $W,$y"
    elif (( y % 50  == 0 )); then MID="$MID line 0,$y 90,$y"
    else                          MINOR="$MINOR line 0,$y 30,$y"
    fi
  done

  magick "$MEASURE" -crop "${W}x240+0+0" +repage \
    -stroke "rgba(255,0,0,0.30)" -strokewidth 1 -draw "$MINOR" \
    -stroke "rgba(255,0,0,0.65)" -strokewidth 1 -draw "$MID" \
    -stroke "rgba(255,0,0,0.85)" -strokewidth 2 -draw "$MAJOR" \
    "$RULER"

  echo "Ruler written: $RULER"
  echo
  echo "Open it and find where the navigation ends. Reading the scale:"
  echo "  full-width line  = 100, 200"
  echo "  long tick        = 50, 150 (halfway between full-width lines)"
  echo "  short tick       = every 10"
  echo
  echo "Pass that number to -c. Round up rather than down: a leftover sliver of"
  echo "nav is obvious in the finished page, a few missing pixels of whitespace"
  echo "are not."
  exit 0
fi

# --- stack mode -----------------------------------------------------------
if [[ -z "$OUT" ]]; then
  echo "Missing -o <output.png>. Run with -h for help." >&2
  exit 1
fi
if [[ $# -lt 2 ]]; then
  echo "Give at least two section images (first one is the hero)." >&2
  exit 1
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

PIECES=()
i=0
for f in "$@"; do
  if [[ ! -f "$f" ]]; then
    echo "File not found: $f" >&2
    exit 1
  fi
  piece="$TMP/$(printf '%03d' "$i").png"
  if [[ $i -eq 0 || "$CROP" -eq 0 ]]; then
    # hero keeps its nav; with -c 0 nothing is cropped at all
    cp "$f" "$piece"
  else
    H=$(magick identify -format "%h" "$f")
    W=$(magick identify -format "%w" "$f")
    NEW=$((H - CROP))
    if [[ $NEW -le 0 ]]; then
      echo "Crop $CROP is taller than $f ($H px)." >&2
      exit 1
    fi
    magick "$f" -crop "${W}x${NEW}+0+${CROP}" +repage "$piece"
  fi
  PIECES+=("$piece")
  i=$((i + 1))
done

# Sections can differ by a pixel or two in width; normalise to the hero.
HERO_W=$(magick identify -format "%w" "${PIECES[0]}")
NORM=()
j=0
for p in "${PIECES[@]}"; do
  n="$TMP/n$(printf '%03d' "$j").png"
  magick "$p" -resize "${HERO_W}x" "$n"
  NORM+=("$n")
  j=$((j + 1))
done

magick "${NORM[@]}" -append "$OUT"

DIM=$(magick identify -format "%wx%h" "$OUT")
echo "Stacked $# sections -> $OUT ($DIM)"
echo "Look at it before building the PDF: no half nav bars at the seams."
