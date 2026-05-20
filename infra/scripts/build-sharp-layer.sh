#!/usr/bin/env bash
# build-sharp-layer.sh
#
# Builds the Sharp Lambda layer for Node.js 20 on Linux x86_64 (Amazon Linux 2 / glibc).
# Sharp ships prebuilt binaries per platform — no Docker or cross-compilation toolchain needed.
#
# Output structure (matches the Lambda Node.js layer convention):
#   infra/layers/sharp/
#     nodejs/                    ← gitignored; this is what CDK packages as the layer ZIP
#       node_modules/
#         sharp/
#         @img/sharp-linux-x64/  ← prebuilt native binary for Lambda
#         ...
#
# Usage:
#   ./infra/scripts/build-sharp-layer.sh      # from repo root
#   npm run layer:build                        # from infra/
#
# Requirements:
#   - Node.js >= 18 (npm >= 10, which understands --cpu/--os/--libc)
#   - Internet access (downloads @img/sharp-linux-x64 prebuilt tarball from npm)
#
# Run this before each `cdk deploy` when layers/sharp/package.json changes.
# In CI this is handled by .github/workflows/deploy-backend.yml.

set -euo pipefail

INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LAYER_SRC="$INFRA_DIR/layers/sharp"
NODEJS_OUT="$LAYER_SRC/nodejs"

echo "Building Sharp Lambda layer..."
echo "  source  : $LAYER_SRC/package.json"
echo "  output  : $NODEJS_OUT/"
echo "  target  : linux/x64/glibc (Amazon Linux 2 — Lambda Node.js 20)"
echo ""

# Clean previous build
rm -rf "$NODEJS_OUT"
mkdir -p "$NODEJS_OUT"

# Copy the declared dependencies into the build dir so npm can install from it
cp "$LAYER_SRC/package.json" "$NODEJS_OUT/package.json"

# Install sharp for linux-x64-glibc.
# --cpu/--os/--libc override the host platform so npm fetches the Lambda-compatible
# prebuilt binary regardless of whether this runs on macOS, Windows, or Linux CI.
# --no-package-lock keeps the build dir clean (version is already pinned in package.json).
npm install \
  --prefix "$NODEJS_OUT" \
  --cpu=x64 \
  --os=linux \
  --libc=glibc \
  --no-package-lock

echo ""
echo "Done. Layer contents:"
ls "$NODEJS_OUT/node_modules/" | sed 's/^/  /'
echo ""
echo "Deploy with: cd infra && npx cdk deploy"
