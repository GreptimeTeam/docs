# Inputs Guide

Ask only the minimum necessary questions.

The response language question is special: it must be asked first, alone, and before every other input question. Do not batch timezone, incident, MCP, access, or Kubernetes questions with it. Wait for the language answer, then localize all subsequent user-facing prompts accordingly.

## Interactive prompt rule

When the agent CLI supports interactive UI, use it instead of asking the user to type prose answers.

Use:

- single-select only for closed one-of-N choices, such as language, incident time known/unknown, primary symptom, MCP yes/no/unknown, export mode, and GreptimeDB HTTP port reachability
- multi-select for capabilities, such as available Kubernetes actions, available fallback access methods, or export capabilities
- confirm for yes/no consent, such as large export confirmation and final export-method confirmation
- true free-text/textbox input for arbitrary values, such as timezone, endpoint URL, database name, namespace, pod name, or output path

Do not use a single-select prompt to simulate arbitrary text input. Many agent CLIs add a built-in custom answer row for single-select prompts; using that for required text input creates a confusing option-list-plus-textbox UI.

Do not manually add `Custom`, `Other`, `Type your own answer`, or catch-all options when the CLI already supports custom answers for selection prompts.

Plain text questions are the fallback when the CLI cannot render a true free-text/textbox control for arbitrary values.

## 0. Response language

Ask the user which language they prefer for questions and the final report. This must be a standalone first message.

If interactive controls are supported, use a single-select prompt:

```text
Preferred language for questions and final report:
- English
- 中文
- 日本語
```

If the preferred language is not English:

- Ask user-facing questions in the preferred language.
- Write the final report content in the preferred language.
- Keep GreptimeDB-specific terms, table names, metric names, SQL keywords, commands, and file paths in English.
- When a translated question may be ambiguous, include the English original in parentheses.
- Keep exported file and directory names in English.

Example:

```text
请选择报告语言（Preferred report language）:
```

After the user answers, continue with the required timezone question in the selected language before asking about incident details, MCP, SQL/HTTP access, Kubernetes access, or export choices.

## 1. User timezone

Ask the user to input their timezone. This is required and must be the first question after response language is selected.

If interactive controls are supported, use a true free-text/textbox prompt with examples, not a single-select prompt and not a prose question:

```text
User timezone (examples: UTC, UTC+8, Asia/Shanghai, America/Los_Angeles):
```

Accepted formats:

- `UTC`
- `UTC+8`
- `UTC-5`
- `Asia/Shanghai`
- `America/Los_Angeles`

## 2. Known incident time

Ask whether the user knows when the incident happened:

- exact time
- approximate time
- unknown, auto-discover

If interactive controls are supported, use a single-select prompt with those options. If the user chooses exact or approximate time, ask the actual time in a separate true free-text/textbox prompt. If no true textbox exists, ask a plain text question instead of using a custom single-select option.

## 3. Symptom

Ask what the user observed:

- write failure
- query failure
- query latency
- OpenTelemetry / logs / metrics ingest issue
- meta / heartbeat / election issue
- region migration / repartition issue
- storage backend issue
- compaction / flush issue
- unknown

If interactive controls are supported, use a single-select prompt. If multiple symptoms apply, use multi-select.

## 4. Self-monitoring instance query access

Ask first:

```text
Which access methods are available for the GreptimeDB Cluster self-monitoring instance that stores logs and metrics for the GreptimeDB cluster being investigated?
```

If interactive controls are supported, use multi-select:

```text
Self-monitoring instance access:
- GreptimeDB MCP connected to the self-monitoring instance
- HTTP port of the self-monitoring instance reachable, usually 4000
- SQL/MySQL/PostgreSQL endpoint of the self-monitoring instance reachable, usually 4002/4003
- Kubernetes access to the self-monitoring GreptimeDB Standalone, usually ${cluster}-monitor-standalone
- Unknown / need help discovering the self-monitoring instance
```

For MCP:

- Explain that MCP must connect to the self-monitoring instance, not the business or production GreptimeDB endpoint, unless that endpoint is also the self-monitoring instance.
- Verify by checking whether `public._gt_logs` exists.
- Use MCP for read-only discovery and validation only.

For the GreptimeDB HTTP port:

- Ask for HTTP host/port, database/schema, and auth method if required.
- Prefer the HTTP port when reachable because it supports both read-only discovery SQL and local file export through `/v1/sql`.

For SQL clients, ask only for the selected endpoint details:

- SQL/MySQL/PostgreSQL endpoint of the self-monitoring instance, usually MySQL port `4002` or PostgreSQL port `4003`
- database/schema, usually `public`
- auth method, if required
- Kubernetes access, if available

Use true free-text/textbox prompts only for the selected methods and missing values. If the CLI lacks a true textbox, ask plain text questions for those values.

## 5. Kubernetes retrieval capability

Ask upfront whether the user has Kubernetes access for port-forwarding SQL/MySQL endpoints or retrieving server-side COPY files with `kubectl cp`.

```text
Do you have kubectl access to the namespace where the self-monitoring GreptimeDB Standalone runs?
```

If interactive controls are supported, use confirm for whether Kubernetes access exists, then multi-select for exact capabilities.

If yes, ask whether they can run:

- `kubectl get pods -n <namespace>`
- `kubectl port-forward -n <namespace> ...`
- `kubectl cp -n <namespace> ...`

Also ask for:

- kube-context, if multiple contexts are configured
- namespace, if known
- whether access allows `kubectl cp`

If the user does not have `kubectl cp` permission, do not choose agent-executed `COPY TO` plus retrieval. Use HTTP port export, user-executed `COPY TO`, or agent-executed `COPY TO` without retrieval.

Do not ask for cluster name, namespace, pod list, or GreptimeDB version upfront. Discover them from self-monitoring data when possible.

## 6. HTTP port and export capability

After access is known and before presenting export choices, first determine whether the GreptimeDB HTTP port is reachable. Prefer this path because it can query and export through the same endpoint. Prefer interactive controls.

```text
GreptimeDB HTTP port reachability:
- Direct HTTP port is reachable, usually 4000
- HTTP port can be reached through kubectl port-forward
- HTTP port is unavailable or blocked
- Unknown, run a small HTTP check
```

If the HTTP port is reachable, collect only the missing values:

- HTTP host and port
- database/schema, usually `public`
- auth method, if required
- local PyArrow validation availability

Then recommend HTTP port export. It uses `/v1/sql` for both discovery and export; export output uses Arrow IPC internally with `zstd` first and `lz4` fallback.

Ask whether SQL `COPY TO` is available in the self-monitoring GreptimeDB environment:

```text
SQL COPY TO availability:
- Available
- Unavailable / blocked by environment
- Unknown, test with a small harmless COPY plan before export
```

Ask detailed `COPY TO` and `kubectl cp` questions only if the HTTP port is unavailable, the user prefers server-side export, or retrieval mode is being considered.

For large HTTP port exports, include row-count preflight, chunking, local disk capacity, runtime, network impact, output format/compression, and PyArrow validation plan in the confirmation prompt. Do not set an HTTP timeout header.
