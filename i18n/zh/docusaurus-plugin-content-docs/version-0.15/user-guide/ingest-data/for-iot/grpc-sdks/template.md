
GreptimeDB 提供了用于高吞吐量数据写入的 ingester 库。
它使用 gRPC 协议，支持自动生成表结构，无需在写入数据前创建表。
更多信息请参考 [自动生成表结构](/user-guide/ingest-data/overview.md#自动生成表结构)。

<InjectContent id="ingester-lib-introduction" content={props.children}/>

## 快速开始 Demo

<InjectContent id="quick-start-demos" content={props.children}/>

## 安装

<InjectContent id="ingester-lib-installation" content={props.children}/>

## 连接数据库

如果你在启动 GreptimeDB 时设置了 [`--user-provider`](/user-guide/deployments-administration/authentication/overview.md)，
则需要提供用户名和密码才能连接到 GreptimeDB。
以下示例显示了使用 SDK 连接到 GreptimeDB 时如何设置用户名和密码。

<InjectContent id="ingester-lib-connect" content={props.children}/>

## 数据模型

表中的每条行数据包含三种类型的列：`Tag`、`Timestamp` 和 `Field`。更多信息请参考 [数据模型](/user-guide/concepts/data-model.md)。
列值的类型可以是 `String`、`Float`、`Int`、`JSON`, `Timestamp` 等。更多信息请参考 [数据类型](/reference/sql/data-types.md)。

## 设置表选项

虽然在通过 SDK 向 GreptimeDB 写入数据时会自动创建时间序列表，但你仍然可以配置表选项。
SDK 支持以下表选项：

- `auto_create_table`：默认值为 `True`。如果设置为 `False`，则表示表已经存在且不需要自动创建，这可以提高写入性能。
- `ttl`、`append_mode`、`merge_mode`：更多详情请参考[表选项](/reference/sql/create.md#table-options)。

<InjectContent id="set-table-options" content={props.children}/>

关于如何向 GreptimeDB 写入数据，请参考以下各节。

## 低层级 API

GreptimeDB 的低层级 API 通过向具有预定义模式的 `table` 对象添加 `row` 来写入数据。

### 创建行数据

以下代码片段首先构建了一个名为 `cpu_metric` 的表，其中包括 `host`、`cpu_user`、`cpu_sys` 和 `ts` 列。
随后，它向表中插入了一行数据。

该表包含三种类型的列：

- `Tag`：`host` 列，值类型为 `String`。
- `Field`：`cpu_user` 和 `cpu_sys` 列，值类型为 `Float`。
- `Timestamp`：`ts` 列，值类型为 `Timestamp`。

<InjectContent id="low-level-object" content={props.children}/>

为了提高写入数据的效率，你可以一次创建多行数据以便写入到 GreptimeDB。

<InjectContent id="create-rows" content={props.children}/>

### 插入数据

下方示例展示了如何向 GreptimeDB 的表中插入行数据。

<InjectContent id="insert-rows" content={props.children}/>

### 流式插入

当你需要插入大量数据时，例如导入历史数据，流式插入是非常有用的。

<InjectContent id="streaming-insert" content={props.children}/>

<InjectContent id="update-rows" content={props.children}/>

<!-- TODO ### Delete Metrics -->

## 高层级 API

SDK 的高层级 API 使用 ORM 风格的对象写入数据，
它允许你以更面向对象的方式创建、插入和更新数据，为开发者提供了更友好的体验。
然而，高层级 API 不如低层级 API 高效。
这是因为 ORM 风格的对象在转换对象时可能会消耗更多的资源和时间。

### 创建行数据

<InjectContent id="high-level-style-object" content={props.children}/>

### 插入数据

<InjectContent id="high-level-style-insert-data" content={props.children}/>

### 流式插入

当你需要插入大量数据时，例如导入历史数据，流式插入是非常有用的。

<InjectContent id="high-level-style-streaming-insert" content={props.children}/>

<InjectContent id="high-level-style-update-data" content={props.children}/>

## 插入 JSON 类型的数据

GreptimeDB 支持使用 [JSON 类型数据](/reference/sql/data-types.md#json-类型) 存储复杂的数据结构。
使用此 ingester 库，你可以通过字符串值插入 JSON 数据。
假如你有一个名为 `sensor_readings` 的表，并希望添加一个名为 `attributes` 的 JSON 列，
请参考以下代码片段。

<InjectContent id="ingester-json-type" content={props.children}/>

<InjectContent id="ingester-lib-debug-logs" content={props.children}/>

## Ingester 库参考

<InjectContent id="ingester-lib-reference" content={props.children}/>

## FAQ

<InjectContent id="faq" content={props.children}/>
