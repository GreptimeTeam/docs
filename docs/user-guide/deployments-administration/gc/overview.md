---
keywords: [GC, Garbage Collection, Mito, Repartition, GreptimeDB]
description: GC keeps SST/index files until all references are released, protecting long queries and repartition workflows.
---
# Overview

GreptimeDB GC delays physical deletion of SST/index files until all references (running queries, repartition cross-region moves) are released. Enable it when you need safe file cleanup during repartition or other workflows that create temporary references; otherwise you can keep it off.

## How it works

- **Meta GC scheduler**: Runs every 5 minutes, ranks leader regions by size and removed-file count, respects a per-region cooldown, and triggers datanodes via mailbox. Dropped/repartitioned regions in `table_repart` are force-cleaned with full file listing and route overrides.
- **Datanode GC worker**: For each region, uses tmp ref manifests from queries plus manifest `removed_files` to decide what can be deleted. Default is fast mode (only manifest-tracked removals). Periodic or forced runs use full listing to find orphan files. Successful deletions clear `removed_files` from the manifest.
- **Lingering protection**: `lingering_time` keeps known-removed files around so long-running queries or cross-region references can finish; `unknown_file_lingering_time` protects files not tracked with an expel time (rare).

## Configuration

Meta (`config/metasrv.example.toml`):

```toml
[gc]
enable = false              # Turn on meta GC scheduler; must match datanode.
gc_cooldown_period = "5m"   # Minimum gap before the same region is GCed again.
```

Datanode (`config/datanode.example.toml`):

```toml
[region_engine.mito.gc]
enable = false                   # Turn on datanode GC worker; must match meta.
lingering_time = "1m"           # Keep known-removed files this long for active queries.
unknown_file_lingering_time = "1h" # Keep files without expel time; rare safeguard.
```

**Important**: `gc.enable` must be set consistently on metasrv and all datanodes. Mismatched flags cause GC to be skipped or stuck.

## When to enable

- Turn on GC during repartition/region moves so cross-region references can drain safely before deletion.
- For clusters with long-running queries, increase `lingering_time` to cover worst-case query duration.
- Leave GC off if you are not repartitioning and do not need delayed deletion.

## Operational notes

- Meta defaults to 5-minute ticks and per-region cooldown; it selects leaders only and skips regions below the size threshold.
- Full file listing is heavier and runs periodically (or is forced for dropped regions); most cycles use fast mode for speed.
- Deleted files live in object storage until GC removes them; ensure storage listing/deletion permissions are in place.
- After enabling, restart metasrv and datanodes to apply config changes.
