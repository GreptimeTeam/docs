# Export Layout Guide

Before exporting, create or propose the fixed local artifact layout. The final deliverable must always be a local directory on the user's/client machine, and every output artifact must be placed under the fixed layout below.

Use the installed skill `scripts/` directory as the canonical implementation. Execute those helper scripts directly. The artifact `commands/` directory records concrete SQL, concrete wrapper invocations, and user-executed scripts for audit and replay; it should not duplicate the helper script implementation unless the user explicitly requests a self-contained artifact.

This local directory is required for all supported export modes:

- **User-executed `COPY TO`**: the local directory must contain ready-to-run SQL/shell scripts, concrete command values, expected self-monitoring filesystem output paths, download instructions, validation queries, and final report template. The user's later execution creates files on the self-monitoring filesystem, not in the local directory.
- **Agent-executed `COPY TO`, no retrieval**: the local directory must contain command records, manifest entries, expected self-monitoring filesystem output paths, download instructions, validation queries, and final report. The data files remain on the self-monitoring filesystem for the user to download later.
- **Agent-executed `COPY TO` + `kubectl cp` retrieval**: `COPY TO` first writes files on the self-monitoring filesystem, then `kubectl cp` retrieves them into the local directory.
- **HTTP port export**: recommended export method when the GreptimeDB HTTP port is reachable. Run the canonical HTTP helper scripts from the skill `scripts/` directory. The local directory must contain command records under `commands/` and generated Arrow IPC files under `logs/` / `metrics/`.

Do not scatter output files in the working directory. Do not invent new top-level directories. If a new artifact type is necessary, place it in the nearest existing subdirectory and add an entry to `manifest.md`.

After the export window and expected row count are known, ask the user to confirm one supported export mode before running any export query or command. Do not treat the default as permission to export.

Separate analysis from export:

- **Analysis / time-window discovery**: use any available self-monitoring query access path: MCP, GreptimeDB HTTP SQL, or a SQL client. MCP and HTTP SQL are peers. This happens before the export choice and is used to find incident windows, estimate rows, and decide what is necessary to export.
- **Data export**: recommend HTTP port export when reachable, then ask the user to choose exactly one export option: HTTP port export; user-executed `COPY TO`; agent-executed `COPY TO` without retrieval; agent-executed `COPY TO` plus `kubectl cp` retrieval. All modes produce the local artifact directory as the handoff, but only the `kubectl cp` and HTTP port modes place data files in it.

If the agent CLI supports interactive UI, use a single export-mode picker, then a final confirm control. Do not make the user type prose such as “use option 1” when a single-select or confirm control is available.

The confirmation prompt must include:

- selected export mode and why
- local artifact directory path and what will be written there
- viable alternatives among the supported modes
- output destination on the self-monitoring filesystem for `COPY TO`, or local Arrow path for HTTP port export
- explicit note that `COPY TO` writes on the self-monitoring filesystem, not the client side
- output format: prefer `parquet`, or `csv.gz` / `json.gz` fallback
- chunking plan, if any
- selected export windows: critical windows and possibly useful context windows when the suspected range is long
- expected row count and whether large-export confirmation is also required
- whether `kubectl cp` retrieval is included, whether the user must download files manually, or whether HTTP port export writes local Arrow directly
- HTTP port export format/compression choice, defaulting to Arrow IPC with `zstd` and `lz4` fallback
- manual `COPY TO` script fallback if the agent cannot directly execute commands

Interactive mode picker example:

```text
Choose export mode:
- HTTP port export: I call GreptimeDB HTTP `/v1/sql` for discovery and export, use Arrow IPC with zstd/lz4 compression for data files, and write files directly into the artifact directory
- User-executed COPY TO: I generate ready-to-run SQL/shell scripts; you execute them and download files manually
- Agent-executed COPY TO, no retrieval: I run COPY TO; files remain on the self-monitoring filesystem for you to download later
- Agent-executed COPY TO + kubectl cp: I run COPY TO, then retrieve files into the local artifact directory with kubectl cp
```

After the method is selected, show the concrete plan and use a confirm prompt:

```text
Confirm export plan?
- Yes, export with this method
- No, change method or destination
```

Example:

```text
Selected export mode: Agent-executed COPY TO + kubectl cp retrieval.
Local artifact directory: ./greptimedb-incident-<YYYYMMDD-HHMMSS>-<timezone>/
Reason: selected because kubectl cp can retrieve files after server-side export. HTTP port export is also available if local client-side export is preferred.
Alternatives: HTTP port export; user-executed COPY TO; agent-executed COPY TO with no retrieval.
Planned destination: /tmp/greptimedb-incident-export/<incident-id>/gt_logs_<start>_<end>.parquet
COPY output location: self-monitoring filesystem first, not local client path.
Local retrieval target: ./greptimedb-incident-<YYYYMMDD-HHMMSS>-<timezone>/logs/
Format: Parquet.
Chunking: hourly files.
Selected windows: critical peak/recovery window plus WARN ramp context window; low-signal background range summarized only.
Expected rows: <n>.
Manual fallback: I can provide a ready-to-run COPY TO script if I cannot execute the export for you.

Please confirm which export method to use before I export data.
```

Fixed layout:

```text
greptimedb-incident-<YYYYMMDD-HHMMSS>-<timezone>/
  README.md
  manifest.md
  metadata/
    inputs.md
    discovered_cluster.md
    timezone.md
    execution_mode.md
    environment.md
  discovery/
    log_level_timeline.csv
    top_log_categories.csv
    metric_candidates.md
    window_selection.md
  logs/
    gt_logs_<start>_<end>.csv
    gt_logs_<start>_<end>.<zstd|lz4>.arrow
    gt_logs_<start>_<end>.parquet
    gt_logs_<window_label>_<start>_<end>.parquet
  metrics/
    <metric_table>_<start>_<end>.csv
    <metric_table>_<start>_<end>.<zstd|lz4>.arrow
    <metric_table>_<start>_<end>.parquet
  commands/
    discovery.sql
    export_logs.sql
    run_http_discovery.sh
    manual_copy_to.sql
    run_http_export.sh
    retrieve_files.sh
    validate_arrow.sh
    validate_rows.sql
    export_metrics.sql
  summary/
    export_report.md
    gaps_and_risks.md
```

Keep the directory names fixed. Create only the files that match the actual export method, but keep all generated files inside these subdirectories. Omit `metrics/` files if no metrics were exported.

Artifact placement rules:

- `README.md`: short human entrypoint explaining what is in the artifact directory.
- `manifest.md`: inventory of every generated file, source, time range, row count when known, and validation status.
- `metadata/`: user inputs, discovered cluster/version, timezone assumptions, execution mode, environment/access notes.
- `discovery/`: lightweight analysis outputs used to choose incident windows.
- `logs/`: actual exported log data only. Do not put SQL scripts or summaries here.
- `metrics/`: optional metric exports only.
- `commands/`: exact SQL, wrapper invocations, and ready-to-run user scripts. Wrappers should call canonical skill scripts through `SKILL_DIR` or a recorded absolute skill path. Do not put exported data here.
- `summary/`: final report and gaps/risks.

If a command writes to a temporary, server-side, or pod-local path first, record that remote path in `manifest.md` and `summary/export_report.md`, then retrieve or instruct retrieval into the fixed local layout.

For user-executed mode, at minimum the local artifact directory must contain:

- `commands/manual_copy_to.sql` or equivalent ready-to-run script with concrete values
- `commands/retrieve_files.sh` when later file retrieval is needed
- `commands/validate_rows.sql` or validation instructions
- `metadata/execution_mode.md` recording that the user will execute scripts manually
- `manifest.md` listing expected remote outputs and the local paths where they should be copied after execution
- `summary/export_report.md` explaining expected outputs and next steps

Default command-record pattern:

```bash
#!/usr/bin/env bash
set -euo pipefail

SKILL_DIR="${SKILL_DIR:-<installed-skill-path>}"

"${SKILL_DIR}/scripts/http_arrow_export.sh" \
  --url "<http-url>" \
  --db "public" \
  --sql "<concrete-export-sql>" \
  --output "../logs/gt_logs_<start>_<end>.arrow"
```

Only create self-contained copies of helper scripts when the user explicitly asks for a portable artifact that can run without the installed skill. If copying helper scripts, record source path, skill version or checksum, copied file checksum, and copy time in `manifest.md`.
