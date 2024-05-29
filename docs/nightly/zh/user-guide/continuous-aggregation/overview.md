# 概述

GreptimeDB 提供连续聚合功能允许你实时聚合数据。
当你需要实时计算和查询总和、平均值或其他聚合时，此功能非常有用。
连续聚合功能由 Flow 引擎提供。
它根据传入的数据不断更新聚合数据。

当你将数据插入 source 表时，数据也会被发送到 Flow 引擎并存储在其中。
Flow 引擎通过时间窗口计算聚合并将结果存储在目标表中。
整个过程如下图所示：

![Continuous Aggregation](/flow-ani.svg)

## 快速开始示例

以下是连续聚合查询的一个完整示例。

首先，使用以下语句创建一个 source 表 `numbers_input` 和一个 sink 表 `out_num_cnt`：

```sql
CREATE TABLE numbers_input (
    number INT,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(number),
    TIME INDEX(ts)
);
```

```sql
CREATE TABLE out_num_cnt (
    sum_number BIGINT,
    start_window TIMESTAMP TIME INDEX,
    end_window TIMESTAMP,
    update_at TIMESTAMP,
);
```

然后创建名为 `test_numbers` 的 flow 来聚合 `numbers_input` 表中 `number` 列的总和，并在 1 秒固定窗口中聚合计算数据。

```sql
CREATE FLOW test_numbers 
SINK TO out_num_cnt
AS 
SELECT sum(number) FROM numbers_input GROUP BY tumble(ts, '1 second', '2021-07-01 00:00:00');
```

要观察 `out_num_cnt` 表中连续聚合的结果，向 source 表 `numbers_input` 插入一些数据。

```sql
INSERT INTO numbers_input 
VALUES
    (20, "2021-07-01 00:00:00.200"),
    (22, "2021-07-01 00:00:00.600");
```

`number` 列的总和为 42 (20+22)，因此 sink 表 `out_num_cnt` 应该包含以下数据：

```sql
SELECT * FROM out_num_cnt;
```

```sql
 sum_number |        start_window        |         end_window         |         update_at          
------------+----------------------------+----------------------------+----------------------------
         42 | 2021-07-01 00:00:00.000000 | 2021-07-01 00:00:01.000000 | 2024-05-17 08:32:56.026000
(1 row)
```

尝试向 `numbers_input` 表中插入更多数据：

```sql
INSERT INTO numbers_input 
VALUES
    (23,"2021-07-01 00:00:01.000"),
    (24,"2021-07-01 00:00:01.500");
```

sink 表 `out_num_cnt` 现在包含两行：分别表示两个 1 秒窗口的数据之和 42 和 47 (23+24) 。

```sql
SELECT * FROM out_num_cnt;
```

```sql
 sum_number |        start_window        |         end_window         |         update_at          
------------+----------------------------+----------------------------+----------------------------
         42 | 2021-07-01 00:00:00.000000 | 2021-07-01 00:00:01.000000 | 2024-05-17 08:32:56.026000
         47 | 2021-07-01 00:00:01.000000 | 2021-07-01 00:00:02.000000 | 2024-05-17 08:33:10.048000
(2 rows)
```

`out_num_cnt` 表中的列解释如下：

- `sum_number`：窗口中 `number` 列的总和。
- `start_window`：窗口的开始时间。
- `end_window`：窗口的结束时间。
- `update_at`：更新行数据的时间。

其中 `start_window`、`end_window` 和 `update_at` 列是 Flow 引擎的时间窗口函数自动添加的。

## 下一步

恭喜你已经初步了解了连续聚合功能。
请参考以下章节了解更多：

- [管理 Flow](./manage-flow.md) 描述了如何创建、更新和删除 flow。你的每个连续聚合查询都是一个 flow。
- [编写查询语句](./query.md) 描述了如何编写连续聚合查询。
- [定义时间窗口](./define-time-window.md) 描述了如何为连续聚合定义时间窗口。时间窗口是连续聚合查询的一个重要属性，它定义了聚合的时间间隔。
- [表达式](./expression.md) 是连续聚合查询中可用表达式。
- 阅读 [容量规划](/user-guide/operations/capacity-plan.md) 指南，了解如何为 Flow 引擎分配内存。内存不足可能导致 OOM 错误，进而使 Flow 引擎退出。
