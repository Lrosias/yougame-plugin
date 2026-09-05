#!/bin/sh
# Zips a game build for upload to YouGame.
#
# YouGame wants the *contents* of the build folder, with index.html at the top of the zip.
# Zipping the folder itself is the single most common upload mistake, so this does it the
# right way and leaves out the things that never belong in a build.
#
# Usage: zip-build.sh [--no-open] <build-folder> [output.zip]
#        --no-open, or YOUGAME_NO_OPEN=1, skips opening the upload page.

set -eu

no_open=${YOUGAME_NO_OPEN:-}
args=""
for a in "$@"; do
  case "$a" in
    --no-open) no_open=1 ;;
    -*) echo "Unknown option: $a" >&2; exit 2 ;;
    *) args="$args
$a" ;;
  esac
done
# shellcheck disable=SC2086
set -f
IFS='
'
set -- $args
unset IFS
set +f

dir=${1:-}
if [ -z "$dir" ]; then
  echo "usage: zip-build.sh [--no-open] <build-folder> [output.zip]" >&2
  exit 2
fi
if [ ! -d "$dir" ]; then
  echo "Not a folder: $dir" >&2
  exit 2
fi
if [ ! -f "$dir/index.html" ]; then
  echo "No index.html at the top level of $dir. YouGame starts the game from index.html; move it up or point me at the right folder." >&2
  exit 1
fi
if ! command -v zip >/dev/null 2>&1; then
  echo "zip is not installed. Any zip of the folder's contents works: index.html must be at the top of the archive." >&2
  exit 1
fi

name=$(basename "$(cd "$dir" && pwd)")
out=${2:-}
if [ -z "$out" ]; then
  out=$(cd "$dir/.." && pwd)/"$name-yougame.zip"
fi
case "$out" in
  *.zip) ;;
  *) echo "The output path must end in .zip (got: $out)" >&2; exit 2 ;;
esac
case "$out" in
  /*) ;;
  *) out="$(pwd)/$out" ;;
esac

# Never ship the things that live next to a build but are not part of it. Every pattern needs
# its `*/` twin: zip matches the stored path, so `.env` alone would let `config/.env` through,
# and that file would then be world-readable on the game's own origin.
rm -f "$out"
(
  cd "$dir"
  zip -r -q -X "$out" . \
    -x '.git/*' '*/.git/*' '.git' '*/.git' '.gitignore' '*/.gitignore' \
      'node_modules/*' '*/node_modules/*' \
      '.env' '.env.*' '*/.env' '*/.env.*' \
      '.npmrc' '*/.npmrc' '*.pem' '*.key' \
      '.DS_Store' '*/.DS_Store' '__MACOSX/*' '*.map' 'Thumbs.db'
)

size=$(wc -c <"$out" | tr -d ' ')
echo "Zipped $dir -> $out ($((size / 1024)) KB)"
if [ "$size" -gt 524288000 ]; then
  echo "That is over YouGame's 500 MB limit; the upload page will refuse it." >&2
fi
echo "Upload it at https://yougame.co/upload (drag the zip onto the page)."

# Best effort: put the upload page in front of the creator and reveal the zip.
if [ -n "$no_open" ]; then
  exit 0
fi
if command -v open >/dev/null 2>&1; then
  open "https://yougame.co/upload" >/dev/null 2>&1 || true
  open -R "$out" >/dev/null 2>&1 || true
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "https://yougame.co/upload" >/dev/null 2>&1 || true
fi
