#!/usr/bin/env bash
# Nightly backup: PostgreSQL dump + uploaded files, keeping the last BACKUP_KEEP days (default 14).
#   DATABASE_URL=postgres://... ./scripts/backup.sh
# Cron example (03:00 every night):
#   0 3 * * * cd /srv/darmon/backend-darmon && ./scripts/backup.sh >> backups/backup.log 2>&1
# Restore:
#   gunzip -c backups/db-<stamp>.sql.gz | psql "$DATABASE_URL"
#   tar -xzf backups/uploads-<stamp>.tar.gz -C "$UPLOAD_DIR"
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -f .env ]]; then
  # Only the variables this script needs, without executing .env
  for name in DATABASE_URL UPLOAD_DIR BACKUP_DIR BACKUP_KEEP; do
    if [[ -z "${!name:-}" ]]; then
      value="$(grep -E "^${name}=" .env | tail -n1 | cut -d= -f2- || true)"
      [[ -n "$value" ]] && export "$name=$value"
    fi
  done
fi

: "${DATABASE_URL:?DATABASE_URL is not set}"
UPLOAD_DIR="${UPLOAD_DIR:-uploads}"
BACKUP_DIR="${BACKUP_DIR:-backups}"
BACKUP_KEEP="${BACKUP_KEEP:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"
umask 077

pg_dump --no-owner --dbname="$DATABASE_URL" | gzip > "$BACKUP_DIR/db-$STAMP.sql.gz"
if [[ -d "$UPLOAD_DIR" ]]; then
  tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C "$UPLOAD_DIR" .
fi

find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'db-*.sql.gz' -o -name 'uploads-*.tar.gz' \) -mtime +"$BACKUP_KEEP" -delete
echo "[$(date -Is)] backup $STAMP done"
