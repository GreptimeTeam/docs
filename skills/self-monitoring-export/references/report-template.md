# Report Template Guide

````markdown
# Self-Monitoring Export Report

## Scope
- This report uses GreptimeDB Cluster self-monitoring data.
- If the user uses a custom monitoring stack, table names and queries may not apply.

## Inputs
- Data source (self-monitoring GreptimeDB instance):
- Access endpoint to the self-monitoring instance:
- Database/schema:
- Logs table:
- User timezone:
- Response/report language:
- Local artifact directory:

## Artifact Layout
- Layout root:
- Manifest: `manifest.md`
- Metadata directory: `metadata/`
- Discovery directory: `discovery/`
- Logs directory: `logs/`
- Metrics directory: `metrics/` or not used
- Commands directory: `commands/`
- Summary directory: `summary/`

## Artifact Manifest Summary
| local path | artifact type | source / remote path | time range UTC | rows | validation status |
|---|---|---|---|---:|---|

## Discovered Cluster Metadata
- Cluster:
- Namespace:
- GreptimeDB version:
- Short version / commit:
- Apps / roles observed:

## Detected Incident Window
- UTC:
- User timezone:
- Detection method: user description / signal index / source lookup / targeted SQL / fallback level aggregation

## Signal Hypothesis
- User-described symptom:
- Signal index entries used:
- Signal index reference: `references/signal-index.md`
- Source modules or exact source strings checked:
- Targeted log keywords:
- Metrics checked:
- Fallback `ERROR` / `WARN` aggregation used: yes/no, reason:

## Export Window
- UTC:
- User timezone:
- Reason this window was selected:

## Long-Range Window Selection
- Critical windows exported:
- Possibly useful context windows exported:
- Low-signal ranges summarized but not exported:
- Reason full long-range export was avoided or confirmed:

## Export Safety Check
- Estimated log rows:
- Largest hourly bucket:
- User confirmation required: yes/no
- Export mode: HTTP port export / user-executed COPY TO / agent-executed COPY TO no retrieval / agent-executed COPY TO plus kubectl cp
- COPY output location on self-monitoring filesystem:
- HTTP port export local output path, including requested compression suffix:
- HTTP export file format / compression requested:
- Data files retrieved locally: yes/no
- Local retrieval target if kubectl cp was used:
- Manual COPY TO script provided: yes/no
- Export chunking strategy:

## Exported Logs
| file | source | time range UTC | rows | notes |
|---|---|---|---:|---|

## Exported Metrics
| file | metric table | time range UTC | rows | why included |
|---|---|---|---:|---|

## Discovery Summary
| signal | source | first_seen | peak | recovered_at | notes |
|---|---|---|---|---|---|

## Commands Used
```sql
...
```

## Language
- Report content language follows the user-selected response language.
- File names, SQL, commands, table names, and metric names remain in English.

## Gaps / Risks
- Missing data:
- Timezone uncertainty:
- Query/export truncation risk:
- Need wider export: yes/no
````
