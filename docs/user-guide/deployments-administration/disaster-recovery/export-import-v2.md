---
keywords: [GreptimeDB, export-v2, import-v2, backup, restore, snapshot, migration, S3, MinIO]
description: Describes how to export, verify, manage, and import GreptimeDB snapshots with the export-v2 and import-v2 CLI commands.
---

# Export and Import Data with Export/Import V2

Export/Import V2 creates portable snapshots of GreptimeDB data. Use it to back up data, restore data, or migrate data between GreptimeDB instances.

A V2 snapshot contains schema metadata, a manifest, and data files. Data files are split into chunks so interrupted export and import jobs can resume from the previous progress.

This guide uses the following commands:

- `greptime cli data export-v2 create` to create a snapshot
- `greptime cli data export-v2 verify` to verify a snapshot
- `greptime cli data export-v2 list` to list snapshots under a parent location
- `greptime cli data export-v2 delete` to delete a snapshot
- `greptime cli data import-v2` to import from a snapshot

## Prerequisites

Before using Export/Import V2, make sure that:

- The GreptimeDB HTTP endpoint is reachable, for example `127.0.0.1:4000`.
- You have a `greptime` binary that includes the `cli data export-v2` and `cli data import-v2` commands.
- The snapshot storage location is readable and writable by both the CLI client and the GreptimeDB server.

For remote object storage, explicitly enable the backend and provide the backend options. For example, use `--s3` with `--s3-bucket` and `--s3-region` for S3-compatible storage.

For `file://` snapshots, the path must be accessible from the GreptimeDB server as well as the CLI client. This usually means running the CLI on the same host as a standalone server, or mounting the same filesystem path into the GreptimeDB server. For remote, Kubernetes, or distributed deployments, use object storage such as S3 or MinIO instead of a local `file://` path.

:::note

The snapshot URI, such as `s3://my-bucket/snapshots/prod`, identifies the snapshot location. The object store options, such as `--s3-bucket my-bucket`, configure how the CLI connects to the backend. Keep them consistent across create, verify, import, list, and delete commands.

:::

## Quick start with local filesystem

Use a local filesystem snapshot only when the path is shared by the CLI client and the GreptimeDB server. For example, this works for a local standalone server when the CLI runs on the same host.

Create a snapshot:

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to file:///tmp/greptime-snapshots/demo
```

Verify the snapshot before restoring it:

```bash
greptime cli data export-v2 verify \
  --snapshot file:///tmp/greptime-snapshots/demo
```

Import from the snapshot:

```bash
greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from file:///tmp/greptime-snapshots/demo
```

By default, export and import use the `greptime` catalog. Add `--catalog <catalog>` if you need another catalog.

## Export to S3 or MinIO

Use the S3 backend for AWS S3 and S3-compatible services such as MinIO.

### S3-compatible endpoint

For MinIO, pass `--s3-endpoint`:

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to s3://greptime/snapshots/local-test \
  --s3 \
  --s3-bucket greptime \
  --s3-region us-west-2 \
  --s3-access-key-id superpower_ci_user \
  --s3-secret-access-key superpower_password \
  --s3-endpoint http://127.0.0.1:9000
```

Use the same storage options when verifying, importing, listing, or deleting the snapshot:

```bash
greptime cli data export-v2 verify \
  --snapshot s3://greptime/snapshots/local-test \
  --s3 \
  --s3-bucket greptime \
  --s3-region us-west-2 \
  --s3-access-key-id superpower_ci_user \
  --s3-secret-access-key superpower_password \
  --s3-endpoint http://127.0.0.1:9000
```

```bash
greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from s3://greptime/snapshots/local-test \
  --s3 \
  --s3-bucket greptime \
  --s3-region us-west-2 \
  --s3-access-key-id superpower_ci_user \
  --s3-secret-access-key superpower_password \
  --s3-endpoint http://127.0.0.1:9000
```

For AWS S3, use the same `--s3` options but omit `--s3-endpoint` unless you use a custom endpoint. If your environment uses instance profiles or another credential provider, explicit access keys may not be required. The S3 backend still requires `--s3`, `--s3-bucket`, and `--s3-region`.

## Export selected schemas

Export only selected schemas with `--schemas`. You can pass a comma-separated list:

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to file:///tmp/greptime-snapshots/observability \
  --schemas public,metrics
```

Or pass the option multiple times:

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to file:///tmp/greptime-snapshots/observability \
  --schemas public \
  --schemas metrics
```

When importing, `--schemas` selects a subset from the snapshot:

```bash
greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from file:///tmp/greptime-snapshots/observability \
  --schemas public
```

If you request a schema that is not in the snapshot, the import fails.

## Export schema only

Use `--schema-only` to export table definitions without data:

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to file:///tmp/greptime-snapshots/schema-only \
  --schema-only
```

Importing a schema-only snapshot restores the schema but does not import data chunks:

```bash
greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from file:///tmp/greptime-snapshots/schema-only
```

## Export by time range and chunk window

Use a bounded time range and a chunk window for large datasets. Export/Import V2 creates one or more data chunks for each schema in the range.

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to s3://greptime/snapshots/prod-2026-06 \
  --start-time 2026-06-01T00:00:00Z \
  --end-time 2026-07-01T00:00:00Z \
  --chunk-time-window 1d \
  --s3 \
  --s3-bucket greptime \
  --s3-region us-west-2 \
  --s3-access-key-id superpower_ci_user \
  --s3-secret-access-key superpower_password \
  --s3-endpoint http://127.0.0.1:9000
```

`--chunk-time-window` requires both `--start-time` and `--end-time`.

Chunks are created by time window. For example, a 15-minute range with `--chunk-time-window 5m` creates 3 chunks. During import, data tasks are scheduled per chunk and per schema. If the snapshot contains 3 chunks and 2 schemas with data, import schedules 6 data tasks.

Snapshot data files are also organized by schema and chunk. For example, a multi-chunk snapshot can contain paths such as:

```text
logs/1/app_logs.parquet
logs/2/app_logs.parquet
logs/3/app_logs.parquet
public/1/host_metrics.parquet
public/2/host_metrics.parquet
public/3/host_metrics.parquet
```

Choose the chunk window based on the data volume and density:

- Use a larger window for small or sparse datasets to avoid too many small chunks.
- Use a smaller window for large datasets to keep each chunk manageable.
- Start with `1d` and adjust after checking export duration and chunk sizes.

## Tune parallelism

Export has two parallelism options:

- `--parallelism` controls server-side `COPY DATABASE` parallelism per schema per chunk. The default is `1`.
- `--chunk-parallelism` controls how many export chunks the client runs concurrently. The default is `1` and the valid range is `1..=64`.

Import uses:

- `--task-parallelism` to control how many import data tasks the client runs concurrently. The default is `1` and the valid range is `1..=64`.

Increase these values gradually and monitor GreptimeDB, object storage, and network resource usage.

## Resume an interrupted export or import

Export/Import V2 is designed to resume interrupted work.

For export:

- If the target snapshot does not exist, `export-v2 create` creates it.
- If the target snapshot already exists, the same command resumes from existing progress.
- Completed chunks are skipped. Failed or pending chunks are retried.
- Use `--force` only when you want to delete the existing snapshot and recreate it.

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to file:///tmp/greptime-snapshots/demo
```

Run the same command again to resume after interruption.

For import, progress is stored in a state file while the import is running. By default, the state file is under `~/.greptime/import_state`. Override it with `--state-path` when you want an explicit state location:

```bash
greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from file:///tmp/greptime-snapshots/demo \
  --state-path /tmp/greptime-import-demo.state
```

`--dry-run` does not create an import state file. A real import keeps the state file if it fails or is interrupted, so the next run can resume completed data tasks. After a successful import, import-v2 automatically deletes the state file because there is no remaining work to resume. A `.lock` file with the same prefix can remain; it is a lock file, not the import state content.

If you intentionally want to rerun an import from scratch after a failed or interrupted run, use a different `--state-path` or remove the previous state file after confirming that doing so is safe.

## Dry-run an import

Use `--dry-run` to validate the snapshot and import plan without executing DDL or importing data:

```bash
greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from file:///tmp/greptime-snapshots/demo \
  --dry-run
```

Dry-run is useful before a production migration or restore.

## Verify, list, and delete snapshots

Verify a snapshot:

```bash
greptime cli data export-v2 verify \
  --snapshot file:///tmp/greptime-snapshots/demo
```

List snapshots under a parent location:

```bash
greptime cli data export-v2 list \
  --location file:///tmp/greptime-snapshots
```

Delete a snapshot:

```bash
greptime cli data export-v2 delete \
  --snapshot file:///tmp/greptime-snapshots/demo
```

For non-interactive deletion, pass `--no-confirm`:

```bash
greptime cli data export-v2 delete \
  --snapshot s3://greptime/snapshots/local-test \
  --no-confirm \
  --s3 \
  --s3-bucket greptime \
  --s3-region us-west-2 \
  --s3-access-key-id superpower_ci_user \
  --s3-secret-access-key superpower_password \
  --s3-endpoint http://127.0.0.1:9000
```

## Authentication, timeout, proxy, and progress

If the GreptimeDB instance has basic authentication enabled, pass credentials with `--auth-basic <username>:<password>`.

Set request timeout with `--timeout`, for example `--timeout 60s` or `--timeout 5m`.

For commands that connect to the GreptimeDB HTTP endpoint, such as `export-v2 create` and `import-v2`, use `--proxy` to set an HTTP proxy, or `--no-proxy` to disable proxy usage:

```bash
greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from file:///tmp/greptime-snapshots/demo \
  --no-proxy
```

Long-running create and import commands support `--progress` to control progress output:

- `auto`: show an interactive bar on a TTY, otherwise log progress. This is the default.
- `always`: always emit progress; it uses a bar on a TTY and lightweight logs otherwise.
- `never`: never emit progress.

## Supported storage backends

Export/Import V2 supports local filesystem snapshots and remote object storage snapshots.

For remote object storage, enable exactly one backend:

- `--s3` for AWS S3 or S3-compatible storage such as MinIO
- `--oss` for Alibaba Cloud OSS
- `--gcs` for Google Cloud Storage
- `--azblob` for Azure Blob Storage

Common S3 options are:

| Option | Description |
| --- | --- |
| `--s3-bucket` | S3 bucket name. Required for S3. |
| `--s3-region` | S3 region. Required for S3. |
| `--s3-access-key-id` | Access key ID. Optional when the environment provides credentials. |
| `--s3-secret-access-key` | Secret access key. Optional when the environment provides credentials. |
| `--s3-endpoint` | Custom S3-compatible endpoint, such as a MinIO endpoint. |
| `--s3-root` | Object store root prefix. |
| `--s3-enable-virtual-host-style` | Enable virtual-hosted-style requests. |
| `--s3-disable-ec2-metadata` | Disable EC2 metadata service credential lookup. |

## Troubleshooting

### Failed to connect to `/v1/sql`

Check that GreptimeDB is running and that `--addr` points to the HTTP endpoint:

```bash
curl http://127.0.0.1:4000/health
```

### `--chunk-time-window` fails validation

`--chunk-time-window` requires both `--start-time` and `--end-time`. Add a bounded time range or remove `--chunk-time-window`.

### S3 or MinIO reports `NoSuchBucket` or `NoSuchKey`

Check that:

- The bucket in the snapshot URI matches `--s3-bucket`.
- `--s3-endpoint` is set for MinIO or other S3-compatible services.
- The credentials can read and write the snapshot location.
- You pass the same storage options to create, verify, import, list, and delete commands.

### Import skips data unexpectedly

Import resumes from its state file. If a previous import marked tasks as completed, a later run with the same state identity may skip them. Use an explicit `--state-path` for each restore operation, or remove the old state file after confirming it is safe.

### A requested schema is not found

When using `--schemas` during import, make sure the schema exists in the snapshot. Use `export-v2 verify` first and check the snapshot contents.

### Verification fails

Do not import a snapshot that fails verification. The snapshot may be incomplete or corrupted. Re-run the export with the same command to resume missing chunks, or recreate the snapshot with `--force` if you intentionally want to discard the existing snapshot.

## Limitations

- Export/Import V2 snapshots are not the same format as the legacy export/import output.
- Schema filtering is schema-level. Table-level filtering is not covered by this command.
- Time-range chunking is designed for time-series data. Sparse data may need a larger chunk window.
- Schema-only snapshots do not contain data files.
- Large migrations require careful tuning of chunk window, parallelism, object storage throughput, and GreptimeDB resources.
