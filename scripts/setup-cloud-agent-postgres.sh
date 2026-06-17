#!/usr/bin/env bash
set -euo pipefail

DB_USER="${POSTGRES_USER:-infra}"
DB_PASSWORD="${POSTGRES_PASSWORD:-infra}"
DB_NAME="${POSTGRES_DB:-infra_portal}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DATABASE_URL="${DATABASE_URL:-postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public}"

log() {
  printf '[cloud-db-setup] %s\n' "$*"
}

need_sudo() {
  if [[ "$(id -u)" -eq 0 ]]; then
    "$@"
  else
    sudo "$@"
  fi
}

install_postgres_if_missing() {
  if command -v psql >/dev/null 2>&1 && command -v pg_isready >/dev/null 2>&1; then
    log "PostgreSQL client tools already available"
    return
  fi

  if ! command -v apt-get >/dev/null 2>&1; then
    log "apt-get is unavailable; install PostgreSQL manually and rerun this script"
    exit 1
  fi

  log "Installing PostgreSQL without Docker"
  need_sudo apt-get update
  need_sudo env DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib
}

start_postgres() {
  log "Starting PostgreSQL service"
  if command -v service >/dev/null 2>&1; then
    need_sudo service postgresql start || true
  fi

  if command -v pg_ctlcluster >/dev/null 2>&1; then
    local clusters
    clusters="$(pg_lsclusters --no-header 2>/dev/null || true)"
    if [[ -n "$clusters" ]]; then
      while read -r version cluster _rest; do
        [[ -z "${version:-}" || -z "${cluster:-}" ]] && continue
        need_sudo pg_ctlcluster "$version" "$cluster" start || true
      done <<< "$clusters"
    fi
  fi
}

wait_for_postgres() {
  log "Waiting for PostgreSQL on ${DB_HOST}:${DB_PORT}"
  for _ in {1..30}; do
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; then
      return
    fi
    sleep 1
  done

  log "PostgreSQL did not become ready"
  exit 1
}

run_as_postgres() {
  if [[ "$(id -un)" == "postgres" ]]; then
    "$@"
  else
    need_sudo -u postgres "$@"
  fi
}

ensure_role_and_database() {
  log "Ensuring role '${DB_USER}' and database '${DB_NAME}' exist"
  run_as_postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';
  ELSE
    ALTER ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;
SQL

  if ! run_as_postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q '^1$'; then
    run_as_postgres createdb -O "$DB_USER" "$DB_NAME"
  fi
}

ensure_env_file() {
  if [[ ! -f .env ]]; then
    if [[ -f .env.example ]]; then
      cp .env.example .env
    else
      touch .env
    fi
  fi

  if grep -q '^DATABASE_URL=' .env; then
    sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" .env
    rm -f .env.bak
  else
    printf 'DATABASE_URL="%s"\n' "$DATABASE_URL" >> .env
  fi
}

verify_connection() {
  log "Verifying DATABASE_URL"
  local psql_url="${DATABASE_URL%%\?*}"
  PGPASSWORD="$DB_PASSWORD" psql "$psql_url" -v ON_ERROR_STOP=1 -c "SELECT 1;" >/dev/null
  log "PostgreSQL is ready for: npm run db:push && npm run db:seed"
}

install_postgres_if_missing
start_postgres
wait_for_postgres
ensure_role_and_database
ensure_env_file
verify_connection
