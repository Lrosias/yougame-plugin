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
if [ "${1:-}" = "--no-open" ]; then
  no_open=1
  shift
fi

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
  /*) ;;
  *) out="$(pwd)/$out" ;;
esac

rm -f "$out"
(
  cd "$dir"
  zip -r -q -X "$out" . \
    -x '.git/*' '.git' '.gitignore' 'node_modules/*' '.DS_Store' '*/.DS_Store' '__MACOSX/*' '*.map' 'Thumbs.db' '.env' '.env.*'
)

size=$(wc -c <"$out" | tr -d ' ')
echo "Zipped $dir -> $out ($((size / 1024)) KB)"
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
