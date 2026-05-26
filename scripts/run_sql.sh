#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 path/to/file.sql"
  exit 1
fi

SQL_FILE="$1"
TMP_FILE="/tmp/$(basename "$SQL_FILE")"

./scripts/render_sql.sh "$SQL_FILE" "$TMP_FILE"
bq query --nouse_legacy_sql < "$TMP_FILE"
