---
keywords: [GC, Garbage Collection, Mito, Repartition, GreptimeDB]
description: GC keeps SST/index files until all references are released, protecting long queries and repartition workflows.
---
# Overview

GreptimeDB GC delays physical deletion of SST/index files until all references (running queries, repartition cross-region moves) are released. Enable it when you need safe file cleanup during repartition or other workflows that create temporary references; otherwise you can keep it off.

## How it works

- **Meta GC scheduler**: Ticks every 5 minutes, considers leader regions above a size threshold, applies per-region cooldown, ranks by size and removed-file count, and triggers datanodes via mailbox. Dropped/repartitioned regions in `table_repart` are force-cleaned with full file listing and route overrides.
- **Datanode GC worker**: Uses tmp ref manifests plus manifest `removed_files` to decide deletions. Default fast mode deletes only manifest-tracked removals; periodic/forced runs do full listing to clean orphans. Successful deletions clear `removed_files` from the manifest.
- **Listing modes**: Fast mode is used most cycles for speed; full listing walks the object store directory to discover files not tracked in the manifest (orphans), and is run periodically or when forced (e.g., dropped regions).
- **Lingering protection**: `lingering_time` keeps known-removed files for long follower-region queries or cross-region references; `unknown_file_lingering_time` guards files without expel time (rare).

## Configuration

Meta (`config/metasrv.example.toml`):

```toml
[gc]
enable = false              # Turn on meta GC scheduler; must match datanode.
gc_cooldown_period = "5m"   # Minimum gap before the same region is GCed again.
```

**Meta options**

| Option | Description |
| --- | --- |
| `enable` | Enable the meta GC scheduler. Must match datanode GC enablement. |
| `gc_cooldown_period` | Minimum interval before the same region is scheduled for GC again; keep datanode `lingering_time` longer than this. |

Datanode (`config/datanode.example.toml`):

```toml
[[region_engine]]
[region_engine.mito]
[region_engine.mito.gc]
enable = false                   # Turn on datanode GC worker; must match meta.
lingering_time = "1m"           # Keep known-removed files this long for active queries.
unknown_file_lingering_time = "1h" # Keep files without expel time; rare safeguard.
```

**Datanode options**

| Option | Description |
| --- | --- |
| `enable` | Enable the datanode GC worker. Must match meta GC `enable`. |
| `lingering_time` | How long to keep manifest-removed files before deletion to protect long follower-region queries/cross-region references; set longer than `gc_cooldown_period`. Use `"None"` to delete immediately. |
| `unknown_file_lingering_time` | Safety hold for files without expel time (not tracked in manifest). Should be generous; these cases are rare. |

:::warning
`gc.enable` must be set consistently on metasrv and all datanodes. Mismatched flags cause GC to be skipped or stuck.
:::

## When to enable

- Turn on GC if need to repartition so cross-region references can drain safely before deletion.
- For clusters with long-running follower-region queries, set `lingering_time` longer than `gc_cooldown_period` so files reference created during a GC cycle stay alive (in-use or lingering) until at least the next cycle.
- Leave GC off if you are not repartitioning and do not need delayed deletion.

## Operational notes

- Deleted files live in object storage until GC removes them; ensure storage listing/deletion permissions are in place.
- After enabling, restart metasrv and datanodes to apply config changes.
