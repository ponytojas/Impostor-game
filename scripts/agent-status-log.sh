#!/usr/bin/env bash
set -euo pipefail

LOG_DIR="/tmp/openclaw-agent-status"
LOG_FILE="$LOG_DIR/impostor.log"
EVENT="${1:-info}"
MESSAGE="${2:-}"
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
PID="$$"

mkdir -p "$LOG_DIR"
printf '%s | %s | pid=%s | %s\n' "$TIMESTAMP" "$EVENT" "$PID" "$MESSAGE" >> "$LOG_FILE"

printf '%s\n' "$LOG_FILE"
