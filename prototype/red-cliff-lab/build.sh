#!/bin/sh
# Build the current learning app, including editorial copy and embedded flag assets.
set -e
cd "$(dirname "$0")/../.."
node scripts/build-standalone.mjs
