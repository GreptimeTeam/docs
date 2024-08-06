# Compaction

For databases based on the LSM Tree, compaction is extremely critical. It merges overlapping fragmented SST files into a single ordered file, discards deleted data while significantly improves query performance.

Until v0.9.1, GreptimeDB provides compaction strategies to control how SST files are compacted: Time windowed compaction strategy (TWCS) and strict window compaction strategy.


## Concepts

Let us start with those core concepts of compaction in GreptimeDB.

### SST files

SSTs are sorted files generated when memtables are flushed to persistent storage, such as disks and object stores.

In GreptimeDB, data rows in SST files are organized by primary keys and timestamps, as illustrated below. Each SST file covers a specific time range. When a query specifies a time range, GreptimeDB retrieves only the relevant SST files that may contain data within that range, rather than loading all persisted files.

![SST layout](/compaction-sst-file-layout.jpg)

Typically, the time ranges of SST files do not overlap during real-time writing workloads. However, due to factors like row deletions and out-of-order writes, SST files may have overlapping time ranges, which can affect query performance.

### Time window

Time-series workloads present prominent "windowed" pattern in that most recently inserted rows are more possible to be read. Thus GreptimeDB logically partitioned the time axis into different time windows and we are more interested in compacting those SST files fall into the same time window. 

Time window for some specific table is usually inferred from the most-recently flushed SST files or users may manually specify the time window if TWCS is chosen.

GreptimeDB has a preset collection of window sizes that are:
- 1 hour
- 2 hours
- 12 hours
- 1 day
- 1 week
- 1 year
- 10 years

If time window is not specified, GreptimeDB will infer it when the first compaction happens by selecting the minimum time window size for the above collection that can cover the whole time span of all files to be compacted.

For example, during the first compaction, the time span for all SST files is 4 hours, then GreptimeDB will choose 12 hours as the time window for that table and persist it for later compactions.

GreptimeDB considers the window contains most recently inserted timestamps as **active window** and those previous windows as **inactive windows**.

### Sorted runs
Sorted runs is a collection of SST files that have sorted and non-overlapping time ranges. 

For example, a table contains 5 SSTs with following time ranges (all inclusive): `[0, 10]`, `[12, 23]`, `[22, 25]`,`[24, 30]`,`[26,33]` and we can find 2 sorted runs:

![num-of-sorted-runs](/compaction-num-sorted-runs.jpg)


The number of sorted runs indicates the orderliness of SST files. More sorted runs typically lead to worse query performance. The main goal of compactions is to reduce the number of sorted runs.

### Levels

Databases based on LSM trees may also have levels, keys are merged level by level. GreptimeDB only has 2 levels which are 0 (uncompacted) and 1 (compacted).

## Compaction strategies
GreptimeDB provides two compaction strategies as mentioned above, but only time windowed compaction strategy (TWCS) can be chosen when creating tables. Strict window is only available when executing manual compactions.

## Time windowed compaction strategy

TWCS primarily aims to reduce read/write amplification during compaction.

It assigns files to be compacted into different time windows. For each window, TWCS identifies the sorted runs. If the number of sorted runs exceeds the maximum allowed, TWCS finds a solution to reduce them to the threshold while considering merging penalties. If the number of sorted runs does not exceed the threshold, TWCS checks for excessive file fragmentation and merges fragmented files if necessary since SST file count also impacts query performance.

For window assignment, SST files may span multiple time windows. TWCS assigns SSTs based on their maximum timestamps to ensure they are not affected by stale data. In time-series workloads, out-of-order writes are infrequent, and even when they occur, recent data's query performance is more critical than that of stale data.


TWCS provides 4 parameters:
- `max_active_window_runs`: max allowed sorted runs in the active window
- `max_active_window_files`: max allowed files in the active window
- `max_inactive_window_runs`: max allowed sorted runs in inactive windows
- `max_inactive_window_files`: max allowed files in inactive windows

Users can set different thresholds for active and inactive windows. This is important because out-of-order writes typically occur in the active window. By allowing more overlapping files in the active window, TWCS reduces write amplification during ingestion and merges all these files when the active window becomes inactive.

Following diagrams show how files in an active window get compacted. 
In A, there're two SST files `[0,3]` and `[5,6,9]` but there's only one sorted run since those two files have disjoint time ranges. 
In B, a new SST file `[1,4]` is flushed therefore forms two sorted runs. Then `[0,3]` and `[1,4]` are merged to `[0,1,3,4]`.
In C, a new SST file `[9,10]` is flushed, and it will be merged with `[5,6,10]` to create `[5,6,9,10]`.
D is the final state, in two compacted files form one sorted run.

![compaction-twcs-active.jpg](/compaction-twcs-active.jpg)

### Specifying TWCS parameters
Users can specify TWCS parameters mentioned above while creating tables, for example:

```sql
CREATE TABLE monitor (
  host STRING,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
  cpu FLOAT64 DEFAULT 0,
  memory FLOAT64,
  PRIMARY KEY(host))
WITH (
    'compaction.type'='twcs', 
    'compaction.twcs.max_active_window_runs'='4', 
    'compaction.twcs.max_active_window_files'='8', 
    'compaction.twcs.max_inactive_window_runs'='1',
    'compaction.twcs.max_inactive_window_files'='2'
    );
```

## Strict window compaction strategy and manual compaction

Unlike TWCS, which assigns one window per SST file based on their maximum timestamps, the strict window strategy assigns SST files to **all** overlapping windows. Consequently, a single SST file may be included in multiple compaction outputs, as its name suggests. Due to its high read amplification, the strict window is not the default compaction strategy. However, it is useful when users need to manually trigger compaction to reorganize the layout of SST files—especially if an individual SST file spans a large time range that significantly slows down queries. GreptimeDB offers a simple SQL function for triggering compaction:

```sql
SELECT COMPACT_TABLE(
    <table_name>, 
    <strategy_name>, 
    [<strategy_parameters>]
);
```

The `<strategy_name>` parameter can be either `twcs` or `strict_window`.
For the `strict_window` strategy, the `<strategy_parameters>` specify the window size (in seconds) for splitting SST files. For example:

```sql
SELECT COMPACT_TABLE(
    "monitor", 
    "strict_window", 
    "3600"
);
```
When executing this statement, GreptimeDB will split each SST file into segments with a time span of 1 hour (3600 seconds) and merge these segments into a single output, ensuring no overlapping files remain.

The following diagram shows the process of strict window compression:

In Figure A, there are 3 overlapping SST files: `[0, 3]` (which includes timestamps 0, 1, 2, and 3), `[3, 8]`, and `[8, 10]`.
The strict window compaction strategy will assign the file `[3, 8]` that covers windows 0, 4, and 8 to three separate windows respectively. This allows it to merge with `[0, 3]` and `[8, 10]` separately.
Figure B shows the final compaction result with three files: `[0, 3]`, `[4, 7]`, and `[8, 10]`. These files do not overlap with each other.

![compaction-strict-window.jpg](/compaction-strict-window.jpg)