#!/bin/zsh
# Dev server launcher.
# 1) Puts the user-local Node on PATH (Turbopack spawns `node` workers).
# 2) Runs through the space-free symlink ~/hoa-repo — Turbopack panics on
#    paths containing spaces ("House of Alexxann").
export PATH="$HOME/.local/node/bin:$PATH"
ln -sfn "$HOME/House of Alexxann" "$HOME/hoa-repo"
cd "$HOME/hoa-repo/apps/web"
exec node ../../node_modules/next/dist/bin/next dev --port "${PORT:-3000}"
