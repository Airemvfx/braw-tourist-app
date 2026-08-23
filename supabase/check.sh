#!/usr/bin/env bash
# ============================================================
# Run schema.sql against a throwaway Postgres and assert the security
# properties still hold.
#
#   ./supabase/check.sh
#
# Needs a local PostgreSQL install (any version from 13 up). It never
# touches your Supabase project — it builds a scratch cluster under
# /tmp, applies stub.sql to stand in for the parts of Supabase the
# schema leans on (auth.users, auth.uid(), storage.objects), applies the
# real schema, then runs check.sql.
#
# What is being protected here is the only thing standing between one
# user's photographs and another's: the browser holds a public key, so
# row-level security and column privileges are the whole access model.
# They are easy to loosen by accident and the loosening is silent.
# ============================================================
set -uo pipefail
cd "$(dirname "$0")"

PGBIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)
[ -n "$PGBIN" ] || PGBIN=$(dirname "$(command -v initdb 2>/dev/null || true)")
if [ ! -x "$PGBIN/initdb" ]; then
  echo "no PostgreSQL found — install it, or run these files by hand against a scratch database" >&2
  exit 2
fi

DATA=$(mktemp -d)/data
SOCK=$(mktemp -d)
PORT=54329
mkdir -p "$DATA"

# initdb refuses to run as root, so drop to the postgres account when
# that is who we are.
AS=""
if [ "$(id -u)" = 0 ] && id -u postgres >/dev/null 2>&1; then
  AS="postgres"
  chown -R postgres "$DATA" "$SOCK" "$(dirname "$DATA")"
fi
run() { if [ -n "$AS" ]; then su "$AS" -c "$*"; else eval "$*"; fi; }

cleanup() { run "$PGBIN/pg_ctl -D $DATA stop -m immediate" >/dev/null 2>&1; }
trap cleanup EXIT

run "$PGBIN/initdb -D $DATA -U postgres --auth=trust" >/dev/null 2>&1 || { echo "initdb failed" >&2; exit 2; }
run "$PGBIN/pg_ctl -D $DATA -o '-k $SOCK -p $PORT -c listen_addresses=' -l $DATA/log start" >/dev/null 2>&1
sleep 2

psql_() { run "$PGBIN/psql -h $SOCK -p $PORT -U postgres -q -v ON_ERROR_STOP=1 $*"; }

[ -n "$AS" ] && chmod a+r ./*.sql

psql_ "-f ./stub.sql"   >/dev/null 2>&1 || { echo "stub.sql failed" >&2; exit 1; }
if ! psql_ "-f ./schema.sql" >/dev/null 2>&1; then
  echo "!! schema.sql failed to apply" >&2
  psql_ "-f ./schema.sql" 2>&1 | grep -i error >&2
  exit 1
fi
echo "schema applied"

OUT=$(psql_ "-f ./check.sql" 2>&1 | sed 's/^psql:.*NOTICE:  //')
echo "$OUT"
if echo "$OUT" | grep -q "FAIL\|ERROR"; then
  echo ""
  echo "!! schema checks failed"
  exit 1
fi
echo ""
echo "$(echo "$OUT" | grep -c '^ok') checks passed"
