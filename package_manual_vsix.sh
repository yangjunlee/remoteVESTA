#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
build="$root/.vsix-build"
out="$root/remote-vesta-opener-0.1.0.vsix"

rm -rf "$build"
mkdir -p "$build/extension"
mkdir -p "$build/_rels"

cp "$root/vsix/[Content_Types].xml" "$build/[Content_Types].xml"
cp "$root/vsix/_rels/.rels" "$build/_rels/.rels"
cp "$root/vsix/extension.vsixmanifest" "$build/extension.vsixmanifest"
cp "$root/package.json" "$build/extension/package.json"
cp "$root/extension.js" "$build/extension/extension.js"
cp "$root/README.md" "$build/extension/README.md"

rm -f "$out"
(
  cd "$build"
  zip -qr "$out" .
)

echo "$out"
