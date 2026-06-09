#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PACKAGE_DIR=$(dirname "$SCRIPT_DIR")
BUILD_CONFIGURATION=${CONFIGURATION:-debug}
OUTPUT_DIR="$PACKAGE_DIR/dist"
APP_DIR="$OUTPUT_DIR/Phived.app"

swift build --package-path "$PACKAGE_DIR" -c "$BUILD_CONFIGURATION"

rm -rf "$APP_DIR"
mkdir -p "$APP_DIR/Contents/MacOS" "$APP_DIR/Contents/Resources"
cp "$PACKAGE_DIR/.build/$BUILD_CONFIGURATION/Phived" "$APP_DIR/Contents/MacOS/Phived"
cp "$PACKAGE_DIR/Resources/Info.plist" "$APP_DIR/Contents/Info.plist"
cp "$PACKAGE_DIR"/Sources/Phived/Resources/*.ttf "$APP_DIR/Contents/Resources/"
cp "$PACKAGE_DIR"/Sources/Phived/Resources/*.svg "$APP_DIR/Contents/Resources/"

ICON_SOURCE="$PACKAGE_DIR/../web/public/icon-512x512.png"
ICONSET="$OUTPUT_DIR/Phived.iconset"
if [ -f "$ICON_SOURCE" ]; then
  rm -rf "$ICONSET"
  mkdir -p "$ICONSET"
  for size in 16 32 128 256 512; do
    sips -z "$size" "$size" "$ICON_SOURCE" --out "$ICONSET/icon_${size}x${size}.png" >/dev/null
    double_size=$((size * 2))
    sips -z "$double_size" "$double_size" "$ICON_SOURCE" --out "$ICONSET/icon_${size}x${size}@2x.png" >/dev/null
  done
  iconutil -c icns "$ICONSET" -o "$APP_DIR/Contents/Resources/Phived.icns"
  rm -rf "$ICONSET"
fi

codesign --force --sign - "$APP_DIR"
printf '%s\n' "$APP_DIR"
