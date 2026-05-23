#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  http_arrow_export.sh --url URL --db DB --sql SQL --output OUTPUT [--headers HEADERS]

Required:
  --url      GreptimeDB HTTP base URL, for example http://localhost:4000
  --db       Database name, usually public
  --sql      SQL query to export. Use fixed UTC boundaries.
  --output   Local output path for Arrow IPC data. The script adds .zstd.arrow or .lz4.arrow.

Optional:
  --headers  Local path to save response headers. Defaults to FINAL_OUTPUT.headers

Environment:
  AUTH_HEADER   Optional Authorization header value, for example "Basic ...".

Behavior:
  - Uses the GreptimeDB HTTP port and /v1/sql?format=arrow.
  - Requests Arrow IPC compression with zstd first, then lz4.
  - Includes the requested Arrow IPC compression format in the final suffix, such as .zstd.arrow or .lz4.arrow.
  - Does not set an HTTP timeout header.
  - Fails on HTTP errors and does not leave a failed response as OUTPUT.
  - Validates output with scripts/validate_arrow.py when available, otherwise inline PyArrow.
USAGE
}

url=""
db=""
sql=""
output=""
headers=""
headers_provided=false
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
    select|with)
      ;;
    *)
      echo "Refusing non-read-only export SQL" >&2
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
    --output)
      output="$2"
      shift 2
      ;;
    --headers)
      headers="$2"
      headers_provided=true
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

if [[ -z "$url" || -z "$db" || -z "$sql" || -z "$output" ]]; then
  usage >&2
  exit 2
fi

if ! printf '%s' "$db" | grep -Eq '^[A-Za-z_][A-Za-z0-9_]*$'; then
  echo "Invalid database name" >&2
  exit 2
fi

validate_sql "$sql"
validate_auth_header

base_endpoint="${url%/}/v1/sql?db=${db}&format=arrow"

encoded_output_path() {
  local requested="$1"
  local encoding="$2"
  local base="$requested"

  case "$base" in
    *.zstd.arrow)
      base="${base%.zstd.arrow}"
      ;;
    *.lz4.arrow)
      base="${base%.lz4.arrow}"
      ;;
    *.arrow)
      base="${base%.arrow}"
      ;;
  esac

  printf '%s.%s.arrow' "$base" "$encoding"
}

base_curl_args=(
  -sS
  --fail-with-body
  -X POST
  -H "X-Greptime-Timezone: UTC"
  -H "Content-Type: application/x-www-form-urlencoded"
  --data-urlencode "sql=${sql}"
)

if [[ -n "${AUTH_HEADER:-}" ]]; then
  curl_config="$(mktemp "${TMPDIR:-/tmp}/greptimedb-http-arrow-curl.XXXXXX")"
  chmod 600 "$curl_config"
  printf 'header = "Authorization: %s"\n' "$AUTH_HEADER" > "$curl_config"
  base_curl_args+=( -K "$curl_config" )
fi

last_status=1
final_output=""
final_headers=""
for encoding in zstd lz4; do
  final_output="$(encoded_output_path "$output" "$encoding")"
  if [[ "$headers_provided" == true ]]; then
    final_headers="$headers"
  else
    final_headers="${final_output}.headers"
  fi

  mkdir -p "$(dirname "$final_output")" "$(dirname "$final_headers")"
  tmp_output="${final_output}.tmp"
  tmp_headers="${final_headers}.tmp"
  rm -f -- "$tmp_output" "$tmp_headers"
  endpoint="${base_endpoint}&compression=${encoding}"
  if curl "${base_curl_args[@]}" -D "$tmp_headers" "$endpoint" --output "$tmp_output"; then
    mv -- "$tmp_output" "$final_output"
    mv -- "$tmp_headers" "$final_headers"
    echo "export_path=${final_output}"
    echo "headers_path=${final_headers}"
    echo "requested_encoding=${encoding}"
    break
  fi
  last_status=$?
done

if [[ -z "$final_output" || ! -s "$final_output" ]]; then
  rm -f -- "$tmp_output" "$tmp_headers"
  echo "HTTP port export failed for zstd and lz4 encodings" >&2
  exit "$last_status"
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
validator="${script_dir}/validate_arrow.py"

if [[ -f "$validator" ]]; then
  python3 "$validator" "$final_output" --schema
  exit 0
fi

python3 - "$final_output" <<'PY'
import sys

path = sys.argv[1]
try:
    import pyarrow.ipc as ipc
except Exception as exc:
    print(f"pyarrow_validation=skipped reason={exc.__class__.__name__}: {exc}")
    raise SystemExit(0)

rows = 0
batches = 0
with open(path, "rb") as f:
    reader = ipc.open_stream(f)
    schema = reader.schema
    for batch in reader:
        batches += 1
        rows += batch.num_rows

print(f"pyarrow_validation=ok batches={batches} rows={rows}")
print(schema)
PY
