#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
PUBLIC_DIR="$ROOT_DIR/public"

rm -rf "$PUBLIC_DIR"
mkdir -p "$PUBLIC_DIR/assets"

cp "$ROOT_DIR/src/index.html" "$PUBLIC_DIR/index.html"
cp "$ROOT_DIR/src/styles.css" "$PUBLIC_DIR/styles.css"
cp "$ROOT_DIR/src/script.js" "$PUBLIC_DIR/script.js"
COPYFILE_DISABLE=1 cp -X "$ROOT_DIR/assets/"* "$PUBLIC_DIR/assets/"

perl -0pi -e 's#\.\./assets/#./assets/#g' "$PUBLIC_DIR/index.html"
find "$PUBLIC_DIR" -name '._*' -type f -delete
