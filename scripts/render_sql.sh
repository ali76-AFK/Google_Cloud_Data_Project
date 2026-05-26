#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Usage: $0 INPUT_SQL OUTPUT_SQL"
  exit 1
fi

INPUT_SQL="$1"
OUTPUT_SQL="$2"

if [ ! -f .env ]; then
  echo ".env file not found"
  exit 1
fi

PROJECT_ID="$(grep '^GOOGLE_CLOUD_PROJECT=' .env | cut -d= -f2-)"

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "YOUR_GCP_PROJECT_ID" ]; then
  echo "Set GOOGLE_CLOUD_PROJECT in .env before rendering SQL"
  exit 1
fi

sed "s/YOUR_GCP_PROJECT_ID/${PROJECT_ID}/g" "$INPUT_SQL" > "$OUTPUT_SQL"

echo "Rendered $INPUT_SQL -> $OUTPUT_SQL with GOOGLE_CLOUD_PROJECT=$PROJECT_ID"
