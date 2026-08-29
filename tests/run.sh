#!/usr/bin/env bash
# Browser checks for BRAW. Needs a static server on :8099 and the Chromium
# that ships with Playwright.
#
#   ./tests/run.sh            # everything
#   ./tests/run.sh build      # one suite
#
# These are the checks that were being re-run by hand after every change,
# which in practice meant they stopped being run. They belong in the repo.
set -uo pipefail
cd "$(dirname "$0")/.."

PORT=8099
if ! curl -sf -o /dev/null "http://localhost:$PORT/"; then
  echo "starting a server on :$PORT"
  python3 -m http.server $PORT >/dev/null 2>&1 &
  SERVER=$!
  trap 'kill $SERVER 2>/dev/null' EXIT
  sleep 1
fi

SUITES=${1:-"prompts build ferry export geo library safety scope photos cloud shop mapview quests i18n-parity dom media terrain contrast sweep nav"}
FAILED=0
for s in $SUITES; do
  echo ""
  echo "=============== $s ==============="
  if node "tests/$s.js"; then :; else echo "!! $s FAILED"; FAILED=1; fi
done
echo ""
[ $FAILED -eq 0 ] && echo "all suites completed" || echo "one or more suites failed"
exit $FAILED
