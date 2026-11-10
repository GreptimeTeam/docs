---
keywords: [压缩任务, 压缩进度, 等待中的压缩, cancel_region_compaction, INFORMATION_SCHEMA]
description: 提供当前 Region 压缩任务的状态、输入文件、时间范围和参数等信息。
---

# COMPACTION_TASKS

`COMPACTION_TASKS` 表列出当前的 Region 压缩任务，包括自动压缩和手动压缩。每行记录任务的状态、输入文件和参数，也提供取消任务所需的 ID。

一个 Region 可以同时有一个活动任务和一个等待中的任务。任务完成、失败或取消后会从表中移除。查询结果随任务状态变化。

```sql
USE INFORMATION_SCHEMA;
DESC COMPACTION_TASKS;
```

输出如下：

```sql
+-------------------+----------------------+-----+------+---------+---------------+
| Column            | Type                 | Key | Null | Default | Semantic Type |
+-------------------+----------------------+-----+------+---------+---------------+
| task_id           | String               |     | NO   |         | FIELD         |
| region_id         | UInt64               |     | NO   |         | FIELD         |
| table_id          | UInt32               |     | NO   |         | FIELD         |
| node_id           | UInt64               |     | YES  |         | FIELD         |
| trigger_type      | String               |     | NO   |         | FIELD         |
| state             | String               |     | NO   |         | FIELD         |
| phase             | String               |     | NO   |         | FIELD         |
| submitted_at      | TimestampMillisecond |     | NO   |         | FIELD         |
| elapsed_millis    | UInt64               |     | NO   |         | FIELD         |
| input_files       | UInt64               |     | YES  |         | FIELD         |
| input_bytes       | UInt64               |     | YES  |         | FIELD         |
| total_units       | UInt64               |     | YES  |         | FIELD         |
| completed_units   | UInt64               |     | YES  |         | FIELD         |
| request_options   | String               |     | NO   |         | FIELD         |
| effective_options | String               |     | YES  |         | FIELD         |
| input_time_start  | TimestampNanosecond  |     | YES  |         | FIELD         |
| input_time_end    | TimestampNanosecond  |     | YES  |         | FIELD         |
| output_time_start | TimestampNanosecond  |     | YES  |         | FIELD         |
| output_time_end   | TimestampNanosecond  |     | YES  |         | FIELD         |
+-------------------+----------------------+-----+------+---------+---------------+
```

`COMPACTION_TASKS` 表的字段说明如下：

- `task_id`：任务的 UUID，在任务生命周期内保持不变。与 `region_id` 一起使用可取消该任务。
- `region_id`：任务所属的物理 Region。
- `table_id`：物理表 ID。可以与 [`TABLES`](./tables.md) 连接查询以获取表名。
- `node_id`：报告该任务的 Datanode；单机模式下为 `0`。对于远程压缩，该字段表示报告任务的 Datanode，而不是远程 Compactor。
- `trigger_type`：`automatic`（自动）或 `manual`（手动）。
- `state`：`queued`（排队中）、`running`（运行中）或 `cancelling`（取消中）。任务可包含多个工作单元，汇总状态时取消优先。
- `phase`：`waiting`（等待）、`planning`（规划）、`executing`（执行）、`committing`（提交）或 `remote`（远程执行）。本地单元处于不同阶段时，优先显示 `committing`，其次为 `executing`，最后为 `waiting`。
- `submitted_at`：任务被接受的时间，精度为毫秒。
- `elapsed_millis`：任务被接受后经过的毫秒数，包括等待时间。
- `input_files`：计划确定后涉及的 SST 文件数（按文件去重），包括直接删除、不参与合并的过期文件。计划生成前为 `NULL`。
- `input_bytes`：这些输入文件的总字节数。
- `total_units`：计划中的本地压缩单元数。远程执行等无法获取该值的情况为 `NULL`。
- `completed_units`：已结束的本地压缩单元数，包含失败的单元，不是成功输出数或字节进度。
- `request_options`：包含请求参数的 JSON 字符串，例如压缩类型、请求的并行度、窗口大小和时间范围。
- `effective_options`：包含最终确定的设置和计划信息的 JSON 字符串，例如 TTL、合并模式和选定的时间窗口。这些信息尚未确定时为 `NULL`。
- `input_time_start`：计划中所有输入 SST 的最早时间戳，包含该端点；统计范围包括过期 SST。
- `input_time_end`：计划中所有输入 SST 的最晚时间戳，包含该端点。
- `output_time_start`：计划输出时间范围的起点，包含该端点。
- `output_time_end`：计划输出时间范围的终点，不包含该端点。

输入计数和时间范围以通过准入检查的计划为准，不会随着各压缩单元完成而减少。时间范围是包络区间，中间可能有空档。输出范围是规划约束，不是最终 SST 文件的实际时间边界；常规压缩可能将其保留为 `NULL`。实际 SST 文件的信息请查询 [`SSTS_MANIFEST`](./ssts-manifest.md)。

时间端点未知、无界或超出纳秒时间戳可表示的范围时，对应字段为 `NULL`。

## 示例

以下输出采集自单机实例执行手动严格窗口压缩的过程。不同运行中的任务 ID、Region ID、计数和阶段可能不同。请在压缩执行期间从另一个客户端运行查询；小任务可能在被观测到之前就已完成。

### 查看当前任务

本例中，表 `compaction_demo_lower` 的 ID 为 `1026`。实际操作时，请使用你自己的实例返回的表、Region 和任务 ID。

```sql
SELECT task_id, region_id, node_id, state, phase
FROM information_schema.compaction_tasks
WHERE table_id = 1026
ORDER BY task_id;
```

```sql
+--------------------------------------+---------------+---------+---------+-----------+
| task_id                              | region_id     | node_id | state   | phase     |
+--------------------------------------+---------------+---------+---------+-----------+
| 627db742-f250-4883-bf97-099e77f02cf0 | 4406636445696 | 0       | running | executing |
+--------------------------------------+---------------+---------+---------+-----------+
```

`manual` 任务可以由 `ADMIN COMPACT_REGION(...)` 或 `ADMIN COMPACT_TABLE(...)` 触发。表级请求可能为多个 Region 生成任务。该表也包含自动压缩任务。

### 查看输入和计划时间范围

```sql
SELECT input_files, input_bytes, total_units, completed_units
FROM information_schema.compaction_tasks
WHERE task_id = '627db742-f250-4883-bf97-099e77f02cf0';
```

```sql
+-------------+-------------+-------------+-----------------+
| input_files | input_bytes | total_units | completed_units |
+-------------+-------------+-------------+-----------------+
| 4           | 2974450     | 1           | 0               |
+-------------+-------------+-------------+-----------------+
```

以下查询将时间戳转换为字符串，使 HTTP 输出显示为可读日期。

```sql
SELECT CAST(input_time_start AS STRING) AS input_time_start,
       CAST(input_time_end AS STRING) AS input_time_end,
       CAST(output_time_start AS STRING) AS output_time_start,
       CAST(output_time_end AS STRING) AS output_time_end
FROM information_schema.compaction_tasks
WHERE task_id = '627db742-f250-4883-bf97-099e77f02cf0';
```

```sql
+---------------------+-------------------------+---------------------+---------------------+
| input_time_start    | input_time_end          | output_time_start   | output_time_end     |
+---------------------+-------------------------+---------------------+---------------------+
| 1970-01-01T00:00:00 | 1970-01-01T00:04:09.999 | 1970-01-01T00:00:00 | 1970-01-01T01:00:00 |
+---------------------+-------------------------+---------------------+---------------------+
```

输入范围包含两端。计划输出范围为左闭右开区间：`[output_time_start, output_time_end)`。严格窗口压缩需要保留跨多个窗口的 SST 中的数据时，该范围可能超出请求的范围。详见[限定手动压缩的时间范围](/user-guide/deployments-administration/manage-data/compaction.md#限定手动压缩的时间范围)。

要查看任务的请求参数和最终确定的设置，可以查询 `request_options` 和 `effective_options`。两者都是 JSON 字符串。

## 取消任务

使用该表返回的 ID 调用 `ADMIN CANCEL_REGION_COMPACTION(region_id, task_id)`。该函数与其他 [ADMIN 函数](/reference/sql/admin.md) 使用相同的权限检查。

```sql
ADMIN CANCEL_REGION_COMPACTION(4406636445696, '627db742-f250-4883-bf97-099e77f02cf0');
```

```sql
+---------------------------------------------------------------------------------------+
| ADMIN CANCEL_REGION_COMPACTION(4406636445696, '627db742-f250-4883-bf97-099e77f02cf0') |
+---------------------------------------------------------------------------------------+
| 1                                                                                     |
+---------------------------------------------------------------------------------------+
```

函数返回值：

- `1`：取消请求已被接受，或任务已处于取消中。任务退出可能还需要一些时间。
- `0`：该 Region 中没有此 ID 对应的任务。如果 Region 本身不存在，调用会报错，而不是返回 `0`。

可以单独取消等待中的任务，而不取消活动任务。取消活动任务时，其他等待中的手动任务会被保留，除非等待中的 DDL 操作优先执行。过期的任务 ID 无法取消替代它的新任务。

取消由任务协作完成，不会立即中断，也不回滚已提交的工作。已经进入提交阶段的单元仍可能完成；任务已无法取消时，调用会报错。不支持取消远程压缩。Metric Engine 内部 metadata region 的任务会显示在此表中，但取消这些任务会返回不支持该操作的错误。取消任务不会禁用该 Region 后续的自动压缩。

再次查询同一个任务 ID，确认任务是否已退出：

```sql
SELECT COUNT(*) AS remaining_tasks
FROM information_schema.compaction_tasks
WHERE task_id = '627db742-f250-4883-bf97-099e77f02cf0';
```

```sql
+-----------------+
| remaining_tasks |
+-----------------+
| 0               |
+-----------------+
```

任务可能在取消请求到达前正常完成，仅凭任务消失无法区分正常完成和取消。该表不记录任务的最终状态，也不保留历史。
