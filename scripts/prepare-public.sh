#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
PUBLIC_DIR="$ROOT_DIR/public"

rm -rf "$PUBLIC_DIR"
mkdir -p "$PUBLIC_DIR/assets"

cp "$ROOT_DIR/src/index.html" "$PUBLIC_DIR/index.html"
cp "$ROOT_DIR/src/styles.css" "$PUBLIC_DIR/styles.css"
cp "$ROOT_DIR/src/script.js" "$PUBLIC_DIR/script.js"
cp "$ROOT_DIR/src/config.js" "$PUBLIC_DIR/config.js"
cp "$ROOT_DIR/src/thank-you.html" "$PUBLIC_DIR/thank-you.html"
cp "$ROOT_DIR/src/privacy.html" "$PUBLIC_DIR/privacy.html"
COPYFILE_DISABLE=1 cp -X "$ROOT_DIR/assets/"* "$PUBLIC_DIR/assets/"

perl -0pi -e 's#\.\./assets/#./assets/#g' "$PUBLIC_DIR/index.html" "$PUBLIC_DIR/thank-you.html"
find "$PUBLIC_DIR" -name '._*' -type f -delete

cp "$PUBLIC_DIR/index.html" "$ROOT_DIR/index.html"
cp "$PUBLIC_DIR/styles.css" "$ROOT_DIR/styles.css"
cp "$PUBLIC_DIR/script.js" "$ROOT_DIR/script.js"
cp "$PUBLIC_DIR/config.js" "$ROOT_DIR/config.js"
cp "$PUBLIC_DIR/thank-you.html" "$ROOT_DIR/thank-you.html"
cp "$PUBLIC_DIR/privacy.html" "$ROOT_DIR/privacy.html"
