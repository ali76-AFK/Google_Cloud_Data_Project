#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 /api/path"
  exit 1
fi

curl -s "http://localhost:8000$1" | jq
