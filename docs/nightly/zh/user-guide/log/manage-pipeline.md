# 管理 Pipeline

在 GreptimeDB 中，每个 `pipeline` 是一个数据处理单元集合，用于解析和转换写入的日志内容。本文档旨在指导您如何创建和删除 Pipeline，以便高效地管理日志数据的处理流程。

## 简介

有关 Pipeline 的具体配置，请阅读 [Pipeline 配置](log-pipeline.md)。

## 创建 Pipeline

GreptimeDB 提供了专用的 HTTP 接口用于创建 Pipeline。
假设你已经准备好了一个 Pipeline 配置文件 pipeline.yaml，使用以下命令上传配置文件，其中 `test` 是你指定的 Pipeline 的名称：

```shell
## 上传 pipeline 文件。test 为 Pipeline 的名称
curl -X "POST" "http://localhost:4000/v1/events/pipelines/test" -F "file=@pipeline.yaml"
```

## 删除 Pipeline

可以使用以下 HTTP 接口删除 Pipeline：

```shell
## test 为 Pipeline 的名称
curl -X "DELETE" "http://localhost:4000/v1/events/pipelines/test"
```

上面的例子中，我们删除了一个名为 `test` 的 Pipeline。

## 查询 Pipeline

目前 GreptimeDB 还不支持通过 HTTP 查询 Pipeline ，但可以使用 SQL 来查询。

```sql
SELECT * FROM greptime_private.pipelines;
```

请注意，如果您使用 MySQL 或者 PostgreSQL 协议作为连接 GreptimeDB 的方式，查询出来的 Pipeline 时间信息精度可能有所不同，可能会丢失纳秒级别的精度。

为了解决这个问题，可以将 `created_at` 字段强制转换为 timestamp 来查看 Pipeline 的创建时间。例如，下面的查询将 `created_at` 以 `bigint` 的格式展示:

```sql
SELECT name,pipeline,created_at::bigint FROM greptime_private.pipelines;
```

查询结果如下：

```
 name |             pipeline              | greptime_private.pipelines.created_at
------+-----------------------------------+---------------------------------------
 test | processors:                      +|                   1719489754257312110
      |   - date:                        +|
      |       field: time                +|
      |       formats:                   +|
      |         - "%Y-%m-%d %H:%M:%S%.3f"+|
      |       ignore_missing: true       +|
      |                                  +|
      | transform:                       +|
      |   - fields:                      +|
      |       - id1                      +|
      |       - id2                      +|
      |     type: int32                  +|
      |   - fields:                      +|
      |       - type                     +|
      |       - logger                   +|
      |     type: string                 +|
      |     index: tag                   +|
      |   - fields:                      +|
      |       - log                      +|
      |     type: string                 +|
      |     index: fulltext              +|
      |   - field: time                  +|
      |     type: time                   +|
      |     index: timestamp             +|
      |                                   |
(1 row)
```

然后可以使用程序将 SQL 结果中的 bigint 类型的时间戳转换为时间字符串。

```shell
timestamp_ns="1719489754257312110"; readable_timestamp=$(TZ=UTC date -d @$((${timestamp_ns:0:10}+0)) +"%Y-%m-%d %H:%M:%S").${timestamp_ns:10}Z; echo "Readable timestamp (UTC): $readable_timestamp"
```

输出：

```shell
Readable timestamp (UTC): 2024-06-27 12:02:34.257312110Z
```

输出的 `Readable timestamp (UTC)` 即为 Pipeline 的创建时间同时也是版本号。