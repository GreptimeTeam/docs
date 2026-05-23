#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate Arrow IPC stream files and print rows, batches, size, and checksum."
    )
    parser.add_argument("paths", nargs="+", help="Arrow IPC stream files to validate")
    parser.add_argument(
        "--expected-rows",
        type=int,
        default=None,
        help="Expected total row count across all input files",
    )
    parser.add_argument(
        "--schema",
        action="store_true",
        help="Print each file schema after validation",
    )
    parser.add_argument("--timestamp-column", default="timestamp", help="Timestamp column to inspect")
    parser.add_argument("--min-timestamp", default=None, help="Inclusive lower timestamp bound")
    parser.add_argument("--max-timestamp", default=None, help="Exclusive upper timestamp bound")
    return parser.parse_args()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file_obj:
        for chunk in iter(lambda: file_obj.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def parse_timestamp(raw: str | None) -> dt.datetime | None:
    if raw is None:
        return None
    value = raw.replace("Z", "+00:00")
    parsed = dt.datetime.fromisoformat(value)
    if parsed.tzinfo is not None:
        return parsed.astimezone(dt.timezone.utc).replace(tzinfo=None)
    return parsed


def comparable_timestamp(value: object) -> dt.datetime:
    if isinstance(value, dt.datetime):
        if value.tzinfo is not None:
            return value.astimezone(dt.timezone.utc).replace(tzinfo=None)
        return value
    raise TypeError(f"Unsupported timestamp value: {value!r}")


def validate_file(path: Path, print_schema: bool, timestamp_column: str) -> tuple[int, dt.datetime | None, dt.datetime | None]:
    try:
        import pyarrow.ipc as ipc
    except Exception as exc:
        print(f"pyarrow_validation=missing reason={exc.__class__.__name__}: {exc}", file=sys.stderr)
        return -1, None, None

    rows = 0
    batches = 0
    first_timestamp = None
    last_timestamp = None
    with path.open("rb") as file_obj:
        reader = ipc.open_stream(file_obj)
        schema = reader.schema
        for batch in reader:
            batches += 1
            rows += batch.num_rows
            if timestamp_column in schema.names and batch.num_rows > 0:
                values = batch.column(timestamp_column)
                for index in range(len(values)):
                    value = values[index].as_py()
                    if value is None:
                        continue
                    comparable = comparable_timestamp(value)
                    if first_timestamp is None or comparable < first_timestamp:
                        first_timestamp = comparable
                    if last_timestamp is None or comparable > last_timestamp:
                        last_timestamp = comparable

    parts = [
        f"file={path}",
        f"rows={rows}",
        f"batches={batches}",
        f"size_bytes={path.stat().st_size}",
        f"sha256={sha256_file(path)}",
    ]
    if first_timestamp is not None and last_timestamp is not None:
        parts.append(f"first_timestamp={first_timestamp.isoformat()}")
        parts.append(f"last_timestamp={last_timestamp.isoformat()}")
    print(" ".join(parts))
    if print_schema:
        print(f"schema_begin file={path}")
        print(schema)
        print(f"schema_end file={path}")
    return rows, first_timestamp, last_timestamp


def main() -> int:
    args = parse_args()
    total_rows = 0
    min_timestamp = parse_timestamp(args.min_timestamp)
    max_timestamp = parse_timestamp(args.max_timestamp)
    global_first_timestamp = None
    global_last_timestamp = None

    for raw_path in args.paths:
        path = Path(raw_path)
        if not path.is_file():
            print(f"missing_file={path}", file=sys.stderr)
            return 2

        rows, first_timestamp, last_timestamp = validate_file(path, args.schema, args.timestamp_column)
        if rows < 0:
            return 3
        total_rows += rows
        if first_timestamp is not None:
            if global_first_timestamp is None or first_timestamp < global_first_timestamp:
                global_first_timestamp = first_timestamp
        if last_timestamp is not None:
            if global_last_timestamp is None or last_timestamp > global_last_timestamp:
                global_last_timestamp = last_timestamp

    print(f"total_rows={total_rows}")
    if global_first_timestamp is not None and global_last_timestamp is not None:
        print(
            f"timestamp_range={global_first_timestamp.isoformat()}..{global_last_timestamp.isoformat()}"
        )
        if min_timestamp is not None and global_first_timestamp < min_timestamp:
            print(
                f"timestamp_lower_bound=failed expected_min={min_timestamp.isoformat()} actual={global_first_timestamp.isoformat()}",
                file=sys.stderr,
            )
            return 1
        if max_timestamp is not None and global_last_timestamp >= max_timestamp:
            print(
                f"timestamp_upper_bound=failed expected_max_exclusive={max_timestamp.isoformat()} actual={global_last_timestamp.isoformat()}",
                file=sys.stderr,
            )
            return 1
    elif min_timestamp is not None or max_timestamp is not None:
        print(
            f"timestamp_validation=failed column={args.timestamp_column} reason=no_timestamp_values",
            file=sys.stderr,
        )
        return 1
    if args.expected_rows is not None:
        diff = total_rows - args.expected_rows
        status = "ok" if diff == 0 else "mismatch"
        print(f"expected_rows={args.expected_rows} diff={diff} status={status}")
        if diff != 0:
            return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
