---
keywords: [压缩任务, 压缩进度, 等待中的压缩, 取消压缩, INFORMATION_SCHEMA]
description: 查看实时 Region 压缩任务、输入文件、时间范围和参数，并通过任务 ID 取消任务。
---

# COMPACTION_TASKS

`COMPACTION_TASKS` 表展示当前的 Region 级压缩任务，包括自动压缩和手动请求的压缩。可以通过该表查看等待中或运行中的任务、检查输入和参数，以及获取用于取消任务的任务 ID。

一个 Region 可以同时有一个活动任务和一个等待中的任务。已完成、失败或已完全取消的任务会从表中消失；该表不保留任务历史。查询结果反映实时状态，不同查询之间可能发生变化。

```sql
DESC TABLE information_schema.compaction_tasks;
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
Total rows: 19
Execution time: 1 ms
```

`COMPACTION_TASKS` 表的字段说明如下：

- `task_id`：任务的 UUID，在任务生命周期内保持不变。与 `region_id` 一起使用可取消该任务。
- `region_id`：任务所属的物理 Region。
- `table_id`：物理表 ID。可以与 [`TABLES`](./tables.md) 连接查询以获取表名。
- `node_id`：报告该任务的 Datanode；单机模式下为 `0`。对于远程压缩，该字段表示报告任务的 Datanode，而不是远程 Compactor。
- `trigger_type`：`automatic`（自动）或 `manual`（手动）。
- `state`：`queued`（排队中）、`running`（运行中）或 `cancelling`（取消中）。汇总任务内各项工作的状态时，取消请求具有优先级。
- `phase`：`waiting`（等待）、`planning`（规划）、`executing`（执行）、`committing`（提交）或 `remote`（远程执行）。本地工作处于多个阶段时，优先显示 `committing`，其次为 `executing`，最后为 `waiting`。
- `submitted_at`：任务被接受的时间，精度为毫秒。
- `elapsed_millis`：任务被接受后经过的毫秒数，包括等待时间。
- `input_files`：已接受计划中不同 SST 文件的数量，包括只会被删除的过期文件。计划尚不可用时为 `NULL`。
- `input_bytes`：这些输入文件的总字节数，表示计划处理的输入大小，而不是已处理的字节数。
- `total_units`：已接受计划中的本地压缩单元数。无法获取时为 `NULL`，包括远程执行的情况。
- `completed_units`：已经结束的本地压缩单元数，包括失败的单元。它不表示成功输出的数量，也不表示按字节计算的进度。
- `request_options`：包含请求参数的 JSON 字符串，例如压缩类型、请求的并行度、窗口大小和时间范围。
- `effective_options`：包含最终确定的设置和计划信息的 JSON 字符串，例如 TTL、合并模式和选定的时间窗口。这些信息尚不可用时为 `NULL`。
- `input_time_start`：计划中所有输入 SST 的最早时间戳，包含该端点；统计范围包括过期 SST。
- `input_time_end`：计划中所有输入 SST 的最晚时间戳，包含该端点。
- `output_time_start`：计划输出时间范围的起点，包含该端点。
- `output_time_end`：计划输出时间范围的终点，不包含该端点。

输入计数和时间范围描述的是调度接受后的计划，不会随着各压缩单元完成而减少。时间范围表示整体覆盖区间，其中可能存在空隙。输出范围是规划约束，不是最终 SST 文件的实际时间边界；常规压缩可能将其保留为 `NULL`。实际 SST 文件的信息请查询 [`SSTS_MANIFEST`](./ssts-manifest.md)。

时间端点未知、无界或超出纳秒时间戳可表示的范围时，对应字段为 `NULL`。时间范围为 `NULL` 并不意味着任务没有输入数据。

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
Total rows: 1
Execution time: 14 ms
```

`manual` 任务可以由 `ADMIN compact_region(...)` 或 `ADMIN compact_table(...)` 触发。表级请求可能为多个 Region 生成任务。该表也包含自动压缩任务。

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
Total rows: 1
Execution time: 9 ms
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
Total rows: 1
Execution time: 11 ms
```

输入范围包含两端。计划输出范围为左闭右开区间：`[output_time_start, output_time_end)`。严格窗口压缩需要保留跨多个窗口的 SST 中的数据时，该范围可能超出请求的范围。详见[限定手动压缩的时间范围](/user-guide/deployments-administration/manage-data/compaction.md#限定手动压缩的时间范围)。

要查看任务的请求参数和最终确定的设置，可以查询 `request_options` 和 `effective_options`。两者都是 JSON 字符串，描述的是配置，而不是持续更新的进度计数。

## 取消任务

使用该表返回的 ID 调用 `ADMIN cancel_region_compaction(region_id, task_id)`。该函数与其他 [ADMIN 函数](/reference/sql/admin.md) 使用相同的权限检查。

```sql
ADMIN cancel_region_compaction(4406636445696, '627db742-f250-4883-bf97-099e77f02cf0');
```

```sql
+---------------------------------------------------------------------------------------+
| ADMIN cancel_region_compaction(4406636445696, '627db742-f250-4883-bf97-099e77f02cf0') |
+---------------------------------------------------------------------------------------+
| 1                                                                                     |
+---------------------------------------------------------------------------------------+
Total rows: 1
Execution time: 0 ms
```

函数返回值：

- `1`：取消请求已被接受，或任务已处于取消中。这不意味着任务已经退出。
- `0`：该 Region 中不存在具有此 ID 的当前任务。Region 本身必须存在。

可以单独取消等待中的任务，而不取消活动任务。取消活动任务时，其他等待中的手动任务会被保留，除非等待中的 DDL 操作优先执行。过期的任务 ID 无法取消替代它的新任务。

取消以协作方式执行，不会回滚已提交的工作，已经进入提交阶段的单元仍可能完成。任务已经无法取消时会返回错误。不支持取消远程压缩。取消任务不会禁用该 Region 后续的自动压缩。

再次查询相同的任务 ID，可以确认任务是否已从当前任务集合中消失：

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
Total rows: 1
Execution time: 12 ms
```

任务可能在取消请求到达前正常完成。仅凭任务消失无法区分它是正常完成还是被取消；该表不保留最终状态的历史记录。
