#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  http_sql_query.sh --url URL --db DB (--sql SQL | --sql-file FILE) --output OUTPUT [--format FORMAT] [--headers HEADERS]

Required:
  --url       GreptimeDB HTTP base URL, for example http://localhost:4000
  --db        Database name, usually public
  --sql       SQL query to execute. Use one read-only statement.
  --sql-file  File containing one read-only SQL statement.
  --output    Local output path for the query result

Optional:
  --format    HTTP SQL output format. Defaults to csvWithNames.
  --headers   Local path to save response headers. Defaults to OUTPUT.headers

Environment:
  AUTH_HEADER   Optional Authorization header value, for example "Basic ...".

Behavior:
  - Uses GreptimeDB HTTP /v1/sql.
  - Sends SQL as application/x-www-form-urlencoded POST data.
  - Sets X-Greptime-Timezone: UTC.
  - Does not set an HTTP timeout header.
  - Rejects obvious write/export statements.
USAGE
}

url=""
db=""
sql=""
sql_file=""
output=""
format="csvWithNames"
headers=""
curl_config=""

cleanup() {
  if [[ -n "$curl_config" ]]; then
    rm -f -- "$curl_config"
  fi
}
trap cleanup EXIT

validate_sql() {
  local input_sql="$1"
  local trimmed
  local first_token

  trimmed="$(printf '%s' "$input_sql" | python3 -c 'import re, sys; value=sys.stdin.read().strip(); value=re.sub(r";\s*$", "", value); print(value, end="")')"
  if [[ -z "$trimmed" || "$trimmed" == *';'* || "$trimmed" == *'--'* || "$trimmed" == *'/*'* || "$trimmed" == *'*/'* ]]; then
    echo "Refusing SQL with comments, multiple statements, or empty body" >&2
    exit 2
  fi

  first_token="$(printf '%s' "$trimmed" | python3 -c 'import re, sys; match=re.match(r"\s*([A-Za-z]+)", sys.stdin.read()); print(match.group(1).lower() if match else "", end="")')"
  case "$first_token" in
    select|with|show|describe|desc)
      ;;
    *)
      echo "Refusing non-read-only SQL" >&2
      exit 2
      ;;
  esac
}

validate_auth_header() {
  if [[ -n "${AUTH_HEADER:-}" && "${AUTH_HEADER}" == *[$'\r\n"\\']* ]]; then
    echo "AUTH_HEADER contains unsupported characters" >&2
    exit 2
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url)
      url="$2"
      shift 2
      ;;
    --db)
      db="$2"
      shift 2
      ;;
    --sql)
      sql="$2"
      shift 2
      ;;
    --sql-file)
      sql_file="$2"
      shift 2
      ;;
    --output)
      output="$2"
      shift 2
      ;;
    --format)
      format="$2"
      shift 2
      ;;
    --headers)
      headers="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ -z "$url" || -z "$db" || -z "$output" ]]; then
  usage >&2
  exit 2
fi

if [[ -n "$sql" && -n "$sql_file" ]]; then
  echo "Use either --sql or --sql-file, not both" >&2
  exit 2
fi

if [[ -z "$sql" && -z "$sql_file" ]]; then
  usage >&2
  exit 2
fi

if [[ -n "$sql_file" ]]; then
  sql="$(<"$sql_file")"
fi

if ! printf '%s' "$db" | grep -Eq '^[A-Za-z_][A-Za-z0-9_]*$'; then
  echo "Invalid database name" >&2
  exit 2
fi

case "$format" in
  greptimedb_v1|json|csv|csvWithNames|csvWithNamesAndTypes|table)
    ;;
  *)
    echo "Invalid output format" >&2
    exit 2
    ;;
esac

validate_sql "$sql"
validate_auth_header

headers="${headers:-${output}.headers}"
endpoint="${url%/}/v1/sql?db=${db}&format=${format}"
mkdir -p "$(dirname "$output")" "$(dirname "$headers")"

tmp_output="${output}.tmp"
tmp_headers="${headers}.tmp"
rm -f -- "$tmp_output" "$tmp_headers"

curl_args=(
  -sS
  --fail-with-body
  -X POST
  -D "$tmp_headers"
  -H "X-Greptime-Timezone: UTC"
  -H "Content-Type: application/x-www-form-urlencoded"
  --data-urlencode "sql=${sql}"
)

if [[ -n "${AUTH_HEADER:-}" ]]; then
  curl_config="$(mktemp "${TMPDIR:-/tmp}/greptimedb-http-sql-curl.XXXXXX")"
  chmod 600 "$curl_config"
  printf 'header = "Authorization: %s"\n' "$AUTH_HEADER" > "$curl_config"
  curl_args+=( -K "$curl_config" )
fi

if curl "${curl_args[@]}" "$endpoint" --output "$tmp_output"; then
  mv -- "$tmp_output" "$output"
  mv -- "$tmp_headers" "$headers"
  echo "query_output=${output}"
  echo "headers_path=${headers}"
  echo "format=${format}"
  exit 0
fi

status=$?
rm -f -- "$tmp_output" "$tmp_headers"
exit "$status"
