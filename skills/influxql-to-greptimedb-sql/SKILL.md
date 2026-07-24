---
name: influxql-to-greptimedb-sql
description: Convert InfluxQL SELECT queries into SQL supported by GreptimeDB and identify semantics that cannot be translated exactly. Use for InfluxDB-to-GreptimeDB migrations, Grafana query rewrites, InfluxQL time-window and fill conversions, function migrations, or requests mentioning "InfluxQL to SQL", "convert InfluxQL", "migrate InfluxDB queries", or "rewrite InfluxQL".
---

# Convert InfluxQL to GreptimeDB SQL

Rewrite InfluxQL queries as reviewable GreptimeDB SQL. Convert queries without executing them unless the user explicitly requests execution.

## Workflow

1. Read [references/mappings.md](references/mappings.md) completely.
2. Determine from the request or table schema:
   - the GreptimeDB table corresponding to the measurement;
   - the GreptimeDB `TIME INDEX` column corresponding to InfluxQL `time`;
   - the columns corresponding to tags and fields;
   - the GreptimeDB version or current repository documentation, especially when using Range Query.
3. Make minimal, explicit assumptions when missing information does not prevent the main conversion. Ask only when the measurement, time column, or target table mapping changes SQL correctness.
4. Rewrite the query structure before rewriting functions:
   - `FROM` measurement → `FROM` table;
   - time predicates → the GreptimeDB time column and `INTERVAL`;
   - `GROUP BY time()` → `date_bin()`, or GreptimeDB Range Query when `fill()` is present;
   - tag grouping → `GROUP BY` or Range Query `BY (...)`;
   - functions → equivalent aggregates, scalar functions, or window expressions.
5. Check the output:
   - order `first_value` and `last_value` explicitly by the time column;
   - convert InfluxQL percentile arguments from percentages to SQL values in `0..1`;
   - remove `/.../` delimiters from regex literals and escape SQL strings correctly;
   - never silently drop `SLIMIT`, `SOFFSET`, `tz()`, or unsupported functions;
   - never describe an approximate conversion as exact.

## Output

Return a SQL code block first. Add only when needed:

- `Assumptions`: table, time column, type, or version assumptions;
- `Semantic differences`: InfluxQL behavior that the SQL does not preserve exactly;
- `Validation`: compare representative row counts, window boundaries, empty windows, and first or last values.

If a safe conversion is impossible, return the convertible SQL skeleton with `TODO` at the exact unresolved location. Never invent a GreptimeDB function.

## Validation

When the user provides a GreptimeDB connection and explicitly requests validation, run `EXPLAIN` before a read-only `SELECT`. Compare at least:

- time-range boundaries;
- `GROUP BY time()` boundaries and offsets;
- results for each tag group;
- empty windows affected by `fill()`;
- ordering semantics for `FIRST`, `LAST`, `TOP`, and `BOTTOM`.
