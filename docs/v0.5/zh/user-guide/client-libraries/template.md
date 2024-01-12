
GreptimeDB 使用不同的客户端库来写入和查询数据。
你根据需求可以选择合适的客户端库。

## 写入数据

GreptimeDB 提供了一个 ingester 库来帮助你写入数据。
它使用 gRPC 协议，支持自动生成表结构，无需在写入数据前创建表。
更多信息请参考 [自动生成表结构](/user-guide/write-data/overview.md#自动生成表结构)。

{template ingester-lib-introduction%%}

### 安装

{template ingester-lib-installation%%}

### 连接数据库

连接 GreptimeDB 时，通常需要用户名和密码。
关于如何设置 GreptimeDB 的鉴权方式，请参考[鉴权](/user-guide/clients/authentication.md)。
这里我们在使用 ingester 库连接 GreptimeDB 时设置用户名和密码。

{template ingester-lib-connect%%}

### 行对象

表中的每条行数据包含三种类型的列：`Tag`、`Timestamp` 和 `Field`。更多信息请参考 [数据模型](/user-guide/concepts/data-model.md)。
列值的类型可以是 `String`、`Float`、`Int`、`Timestamp` 等。更多信息请参考 [数据类型](/reference/data-types.md)。

{template row-object%%}

### 创建行数据

下面的例子展示了如何创建包含 `Tag`、`Timestamp` 和 `Field` 列的行。`Tag` 列是 `String` 类型，`Timestamp` 列是 `Timestamp` 类型，`Field` 列是 `Float` 类型。

{template create-a-row%%}

为了提高写入数据的效率，你可以一次创建多行数据写入 GreptimeDB。

{template create-rows%%}

### 保存行数据

下方的例子展示了如何将行数据保存到 GreptimeDB 中。

{template save-rows%%}

### 更新行数据

请参考 [更新数据](/user-guide/write-data/overview.md#更新数据)了解更新机制。
下面的例子展示了先保存一行数据，然后更新这行数据。

{template update-rows%%}

<!-- TODO ### Delete Metrics -->

{template ingester-lib-debug-logs%%}

### 更多示例

{template more-ingestion-examples%%}

### Ingester 库参考

{template ingester-lib-reference%%}

## 查询数据

GreptimeDB 使用 SQL 作为主要查询语言，兼容 MySQL 和 PostgreSQL。
因此，我们推荐使用成熟的 SQL 驱动来查询数据。

### 推荐的查询库

{template recommended-query-library%%}

### 安装

{template query-library-installation%%}

### 连接到数据库

下方的例子展示了如何连接到 GreptimeDB：

{template query-library-connect%%}

### Raw SQL

我们推荐使用 Raw SQL 来体验 GreptimeDB 的全部功能。
下面的例子展示了如何使用 Raw SQL 查询数据：

{template query-library-raw-sql%%}

### 查询库参考

有关如何使用查询库的更多信息，请参考相应库的文档：

{template query-lib-doc-link%%}
