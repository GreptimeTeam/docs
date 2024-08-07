
GreptimeDB 提供了用于高吞吐量数据写入的 ingester 库。
它使用 gRPC 协议，支持自动生成表结构，无需在写入数据前创建表。
更多信息请参考 [自动生成表结构](/user-guide/ingest-data/overview.md#自动生成表结构)。

{template ingester-lib-introduction%%}

## 安装

{template ingester-lib-installation%%}

## 连接数据库

连接 GreptimeDB 时，通常需要用户名和密码。
关于如何设置 GreptimeDB 的鉴权方式，请参考[鉴权](/user-guide/clients/authentication.md)。
这里我们在使用 ingester 库连接 GreptimeDB 时设置用户名和密码。

{template ingester-lib-connect%%}

## 数据模型

表中的每条行数据包含三种类型的列：`Tag`、`Timestamp` 和 `Field`。更多信息请参考 [数据模型](/user-guide/concepts/data-model.md)。
列值的类型可以是 `String`、`Float`、`Int`、`Timestamp` 等。更多信息请参考 [数据类型](/reference/sql/data-types.md)。

## 低层级 API

GreptimeDB 的低层级 API 通过向具有预定义模式的 `table` 对象添加 `row` 来写入数据。

### 创建行数据

以下代码片段首先构建了一个名为 `cpu_metric` 的表，其中包括 `host`、`cpu_user`、`cpu_sys` 和 `ts` 列。
随后，它向表中插入了一行数据。

该表包含三种类型的列：

- `Tag`：`host` 列，值类型为 `String`。
- `Field`：`cpu_user` 和 `cpu_sys` 列，值类型为 `Float`。
- `Timestamp`：`ts` 列，值类型为 `Timestamp`。

{template low-level-object%%}

为了提高写入数据的效率，你可以一次创建多行数据以便写入到 GreptimeDB。

{template create-rows%%}

### 插入数据

下方示例展示了如何向 GreptimeDB 的表中插入行数据。

{template insert-rows%%}

### 流式插入

当你需要插入大量数据时，例如导入历史数据，流式插入是非常有用的。

{template streaming-insert%%}

{template update-rows%%}

<!-- TODO ### Delete Metrics -->

## 高层级 API

SDK 的高层级 API 使用 ORM 风格的对象写入数据，
它允许你以更面向对象的方式创建、插入和更新数据，为开发者提供了更友好的体验。
然而，高层级 API 不如低层级 API 高效。
这是因为 ORM 风格的对象在转换对象时可能会消耗更多的资源和时间。

### 创建行数据

{template high-level-style-object%%}

### 插入数据

{template high-level-style-insert-data%%}

### 流式插入

当你需要插入大量数据时，例如导入历史数据，流式插入是非常有用的。

{template high-level-style-streaming-insert%%}

{template high-level-style-update-data%%}

## 更多示例

{template more-ingestion-examples%%}

{template ingester-lib-debug-logs%%}

## Ingester 库参考

{template ingester-lib-reference%%}

<!-- ## 查询数据

GreptimeDB 使用 SQL 作为主要查询语言，兼容 MySQL 和 PostgreSQL。
因此，我们推荐使用成熟的 SQL 驱动来查询数据。

### 推荐的查询库

{template recommended-query-library%%}

### 安装

{template query-library-installation%%}

### 连接数据库

下方的例子展示了如何连接到 GreptimeDB：

{template query-library-connect%%}

### Raw SQL

我们推荐使用 Raw SQL 来体验 GreptimeDB 的全部功能。
下面的例子展示了如何使用 Raw SQL 查询数据：

{template query-library-raw-sql%%}

### 查询库参考

有关如何使用查询库的更多信息，请参考相应库的文档：

{template query-lib-doc-link%%} -->
