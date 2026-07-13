#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
PUBLIC_DIR="$ROOT_DIR/public"
TY_SITE_SRC_DIR="$ROOT_DIR/src/thank-you-site"
TY_SITE_PUBLIC_DIR="$PUBLIC_DIR/thank-you-site"
TY_SITE_ROOT_DIR="$ROOT_DIR/thank-you-site"

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

# Thank-you subdomain bundle — the GHL redirect target is planned to live on a
# SEPARATE Hostinger site once ship day arrives, so its source stays isolated
# under src/thank-you-site/ (own config/script/styles/assets, no shared file
# with the ceo page above). Asset paths inside it are already "./assets/",
# same relative depth in src and public, so no path rewrite is needed here.
if [ -d "$TY_SITE_SRC_DIR" ]; then
  rm -rf "$TY_SITE_PUBLIC_DIR"
  mkdir -p "$TY_SITE_PUBLIC_DIR/assets"

  cp "$TY_SITE_SRC_DIR/index.html" "$TY_SITE_PUBLIC_DIR/index.html"
  cp "$TY_SITE_SRC_DIR/styles.css" "$TY_SITE_PUBLIC_DIR/styles.css"
  cp "$TY_SITE_SRC_DIR/script.js" "$TY_SITE_PUBLIC_DIR/script.js"
  cp "$TY_SITE_SRC_DIR/config.js" "$TY_SITE_PUBLIC_DIR/config.js"
  if [ -d "$TY_SITE_SRC_DIR/assets" ]; then
    COPYFILE_DISABLE=1 cp -X "$TY_SITE_SRC_DIR/assets/"* "$TY_SITE_PUBLIC_DIR/assets/"
  fi
  find "$TY_SITE_PUBLIC_DIR" -name '._*' -type f -delete

  rm -rf "$TY_SITE_ROOT_DIR"
  mkdir -p "$TY_SITE_ROOT_DIR"
  cp -R "$TY_SITE_PUBLIC_DIR/." "$TY_SITE_ROOT_DIR/"
fi
