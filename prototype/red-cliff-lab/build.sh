#!/bin/sh
# Assemble prototype/red-cliff-lab/index.html from src/ parts.
# Regenerate data first if the seed DB changed:
#   python scripts/build_red_cliff_lab_data.py
set -e
cd "$(dirname "$0")"
S=src
{
  cat $S/00-head.html $S/10-styles-course.html $S/11-styles-stages.html $S/20-markup.html
  echo '<script>'
  cat $S/30-data.js $S/40-app.js $S/50-fx.js $S/60-intro.js
  echo 'route();intro();'
  echo '</script>'
} > index.html
echo "built $(pwd)/index.html"
