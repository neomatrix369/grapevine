#!/bin/bash
export PATH=/opt/homebrew/bin:$HOME/.local/bin:$PATH
export REPO=/Users/swami/git-repos/ai-ml-dl-stuff/hackathons/grokbot-community-london-2026/grapevine
WT=$REPO/../grapevine-community-read; G=$HOME/hackathon-smoke; L=/tmp/gv-live; mkdir -p $L/raw
command -v timeout >/dev/null || timeout(){ perl -e 'alarm shift; exec @ARGV' "$@"; }
ts(){ date +%H:%M:%S; }
( cd $G && npm i --no-audit --no-fund pg @huggingface/transformers >$L/npm.log 2>&1; echo "npm exit $?" >>$L/npm.log ) &
NPM=$!

echo "$(ts) COMMIT phase"
( cd $WT && git fetch -q origin && git merge -q --ff-only origin/main; mkdir -p reader/live && cp $G/gv-read.mjs $G/gv-load.mjs $G/gv-cognee.mjs $G/gv-run.sh reader/live/
  grep -q '^data/raw' .gitignore 2>/dev/null || printf 'data/raw/\ndata/held-back/\n' >> .gitignore
  echo "- $(date +%H:%M) BST [grok-bot] Live community read: read-only CDP reader (Slack 9222 / Discord 9223, loopback), Supabase loader (channels, people, messages + gte-small 384-d embeddings, coverage, graph) and Cognee Cloud ingest in reader/live/. Raw text stays out of git." >> PROGRESS.md
  BW=$(git ls-files | grep -i 'built-with' | head -1); [ -z "$BW" ] && BW=docs/BUILT-WITH.md
  echo "| Grok Bot | Live Slack + Discord read (read-only, CDP), Supabase load + embeddings, Cognee Cloud (hosted, sponsor) add/cognify/graph via X-Api-Key | reader/live/ (PR feat/community-read) |" >> $BW
  git add reader/live .gitignore PROGRESS.md $BW && git commit -q -m "[grok-bot] feat(reader): live read-only Slack/Discord reader, Supabase loader, Cognee Cloud ingest" -m "Built-with: Grok Bot" && git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push -q -u origin feat/community-read 2>&1 | tail -2
  gh pr create --base main --head feat/community-read --title "[grok-bot] Live community reader, Supabase loader, Cognee Cloud ingest" --body "Read-only CDP reader for the Slack/Discord desktop apps (loopback port, restored after), Supabase loader (channels, people, messages + gte-small embeddings, coverage, graph_nodes/edges) and Cognee Cloud ingest (hosted HTTP API). No message text in git. Built-with: Grok Bot" 2>&1 | tail -1 ) 2>&1 | sed 's/^/git: /'
RESTORED=0
restore(){ [ $RESTORED = 1 ] && return; RESTORED=1; echo "$(ts) RESTORE"; osascript -e 'quit app "Slack"' 2>/dev/null; osascript -e 'quit app "Discord"' 2>/dev/null
  for i in $(seq 15); do pgrep -x Slack >/dev/null || pgrep -x Discord >/dev/null || break; sleep 1; done; pkill -x Slack 2>/dev/null; pkill -x Discord 2>/dev/null; sleep 2
  open -a Slack; open -a Discord; sleep 8
  echo "RESTORE: procs_with_debug_flag=$(ps ax -o command | grep -c '[r]emote-debugging-port') slack_running=$(pgrep -x Slack >/dev/null && echo yes || echo no) discord_running=$(pgrep -x Discord >/dev/null && echo yes || echo no) listeners_9222_9223=$(lsof -nP -iTCP:9222 -iTCP:9223 -sTCP:LISTEN 2>/dev/null | tail -n +2 | wc -l | tr -d ' ')"; }
trap restore EXIT
echo "$(ts) READ phase"
osascript -e 'quit app "Slack"'; osascript -e 'quit app "Discord"'
for i in $(seq 15); do pgrep -x Slack >/dev/null || pgrep -x Discord >/dev/null || break; sleep 1; done; pkill -x Slack 2>/dev/null; pkill -x Discord 2>/dev/null; sleep 2
open -a Slack --args --remote-debugging-port=9222 --remote-debugging-address=127.0.0.1
open -a Discord --args --remote-debugging-port=9223 --remote-debugging-address=127.0.0.1
sleep 6
for p in 9222 9223; do BAD=$(lsof -nP -iTCP:$p -sTCP:LISTEN 2>/dev/null | tail -n +2 | grep -v -e '127.0.0.1' -e '\[::1\]' | wc -l | tr -d ' '); echo "port $p non-loopback listeners=$BAD"; [ "$BAD" != 0 ] && { echo "NON-LOOPBACK, aborting"; exit 1; }; done
cd $G; timeout 360 node gv-read.mjs slack & S=$!; timeout 360 node gv-read.mjs discord & D=$!; wait $S $D
restore; trap - EXIT
echo "$(ts) LOAD phase (waiting npm)"; wait $NPM; tail -1 $L/npm.log
cd $G && node gv-load.mjs
echo "$(ts) COGNEE CLOUD phase"; cd $G && timeout 600 node gv-cognee.mjs 2>&1 | cut -c1-200 | tail -12
echo "$(ts) ALL DONE"
