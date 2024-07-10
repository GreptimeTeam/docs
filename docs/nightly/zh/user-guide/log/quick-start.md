# 快速开始

首先请确保您的 GreptimeDB 的版本为 0.9.0 或更高版本。

## 1. 下载并安装 GreptimeDB & 启动 GreptimeDB

请遵循 [安装指南](../../getting-started/overview.md) 来安装并启动 GreptimeDB。

## 2. 创建 Pipeline

我们提供了专门的 http 接口进行 Pipeline 的创建，接口如下：

```shell
## 创建 pipeline 文件
cat > pipeline.yaml <<EOF
processors:
  - date:
      field: time
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
      ignore_missing: true

transform:
  - fields:
      - id1
      - id2
    type: int32
  - fields:
      - type
      - log
      - logger
    type: string
  - field: time
    type: time
    index: timestamp
EOF

## 上传 pipeline 文件。test 为 Pipeline 的名称
curl -X "POST" "http://localhost:4000/v1/events/pipelines/test" -F "file=@pipeline.yaml"
```


在上述示例中，我们创建了一个名为 `test` 的 Pipeline，并收到了如下响应：`{"name":"test","version":"2024-06-27 12:02:34.257312110Z"}`。其中，`name` 为 Pipeline 名称，`version` 为 Pipeline 版本号。

此 Pipeline 包含一个 Processor 和三个 Transform。它首先使用 Rust 的时间格式化字符串 `%Y-%m-%d %H:%M:%S%.3f` 解析日志中的 timestamp 字段，然后将 id1 和 id2 字段转换为 int32 类型，level、content、logger 字段转换为 string 类型，最后将 timestamp 字段转换为时间类型，并将其设置为 timestamp 索引。请注意。**此处仅作为展示。具体的 Pipeline 语法请参考 [Pipeline 介绍](log-pipeline.md)。**



## 3. 查询 Pipeline

目前 nightly 版本的 GreptimeDB 还不支持 http 查询 Pipeline 的功能。我们后续会增加相关接口以便您可以更好的获取 Pipeline 信息。目前仅可以使用 sql 形式来查询 Pipeline 的信息。

```sql
SELECT * FROM greptime_private.pipelines;
```

查询结果如下：

```sql
 name | schema | content_type |             pipeline              |         created_at
------+--------+--------------+-----------------------------------+----------------------------
 test | public | yaml         | processors:                      +| 2024-06-27 12:02:34.257312
      |        |              |   - date:                        +|
      |        |              |       field: time                +|
      |        |              |       formats:                   +|
      |        |              |         - "%Y-%m-%d %H:%M:%S%.3f"+|
      |        |              |       ignore_missing: true       +|
      |        |              |                                  +|
      |        |              | transform:                       +|
      |        |              |   - fields:                      +|
      |        |              |       - id1                      +|
      |        |              |       - id2                      +|
      |        |              |     type: int32                  +|
      |        |              |   - fields:                      +|
      |        |              |       - type                     +|
      |        |              |       - log                      +|
      |        |              |       - logger                   +|
      |        |              |     type: string                 +|
      |        |              |   - field: time                  +|
      |        |              |     type: time                   +|
      |        |              |     index: timestamp              |
(1 row)
```

注：`greptime_private.pipelines` 是 GreptimeDB 内部表，用于存储 Pipeline 的信息。created_at 字段表示 Pipeline 的创建时间同时也是版本号。但是 mysql 或者 postgresql 协议连接 GreptimeDB 时，查询出来的 Pipeline 时间信息精度可能有所不同。可能会丢失纳秒级别的精度。可参考 [管理 Pipeline](manage-pipeline.md) 获取更多信息。

## 4. 写入日志

我们提供了专门的 http 接口进行日志的写入，接口如下：

```shell
curl -X "POST" "http://localhost:4000/v1/events/logs?db=public&table=logs&pipeline_name=test" \
     -H 'Content-Type: application/json' \
     -d $'{"time":"2024-05-25 20:16:37.217","id1":"2436","id2":"2528","type":"I","logger":"INTERACT.MANAGER","log":"ClusterAdapter:enter sendTextDataToCluster\\n"}
{"time":"2024-05-25 20:16:37.217","id1":"2436","id2":"2528","type":"I","logger":"INTERACT.MANAGER","log":"ClusterAdapter:enter sendTextDataToCluster\\n"}
{"time":"2024-05-25 20:16:37.217","id1":"2436","id2":"2528","type":"I","logger":"INTERACT.MANAGER","log":"ClusterAdapter:enter sendTextDataToCluster\\n"}
{"time":"2024-05-25 20:16:37.217","id1":"2436","id2":"2528","type":"I","logger":"INTERACT.MANAGER","log":"ClusterAdapter:enter sendTextDataToCluster\\n"}'
```
上述命令返回结果如下：

```json
{"output":[{"affectedrows":4}],"execution_time_ms":22}
```

上面的例子中，我们向 `public.logs` 表中写入了 4 条日志。请注意。**此处仅作为展示。具体的日志写入语法请参考 [配合 Pipeline 写入日志](write-log.md)。**

## 5. logs 表结构

`public.logs` 表结构如下：

```sql
DESC TABLE logs;
 Column |        Type         | Key | Null | Default | Semantic Type
--------+---------------------+-----+------+---------+---------------
 id1    | Int32               |     | YES  |         | FIELD
 id2    | Int32               |     | YES  |         | FIELD
 type   | String              |     | YES  |         | FIELD
 log    | String              |     | YES  |         | FIELD
 logger | String              |     | YES  |         | FIELD
 time   | TimestampNanosecond | PRI | NO   |         | TIMESTAMP
(6 rows)
```

从上述结果可以看出，`public.logs` 表包含了 6 个字段，根据 Pipeline 处理后的结果。 id1 和 id2 都被转换为 int32 类型，type、log、logger 都被转换为 string 类型，time 被转换为时间戳类型，并且设置为 timestamp 索引。这样的设计旨在优化查询性能，特别是对于时间序列数据的查询。

## 5. 查询日志

目前 nightly 版本的 GreptimeDB 还不支持 http 查询日志的功能。我们后续会增加相关接口以便您可以更好的查询日志。目前仅可以使用 sql 形式来查询日志。

```shell
# 使用 mysql 或者 postgresql 协议连接 GreptimeDB

# mysql
mysql --host=127.0.0.1 --port=4002 public

# postgresql
psql -h 127.0.0.1 -p 4003 -d public
```

```sql
SELECT * FROM public.logs;
 id1  | id2  | type |                    log                     |      logger      |            time
------+------+------+--------------------------------------------+------------------+----------------------------
 2436 | 2528 | I    | ClusterAdapter:enter sendTextDataToCluster+| INTERACT.MANAGER | 2024-05-25 20:16:37.217000
      |      |      |                                            |                  |
 2436 | 2528 | I    | ClusterAdapter:enter sendTextDataToCluster+| INTERACT.MANAGER | 2024-05-25 20:16:37.217000
      |      |      |                                            |                  |
 2436 | 2528 | I    | ClusterAdapter:enter sendTextDataToCluster+| INTERACT.MANAGER | 2024-05-25 20:16:37.217000
      |      |      |                                            |                  |
 2436 | 2528 | I    | ClusterAdapter:enter sendTextDataToCluster+| INTERACT.MANAGER | 2024-05-25 20:16:37.217000
      |      |      |                                            |                  |
(4 rows)
```

通过格式转换可以更好的进行结构化查询。

## 结语

通过以上步骤，您已经成功地创建了 Pipeline，写入了日志，并进行了查询。这只是 GreptimeDB 提供功能的冰山一角。为了充分利用 GreptimeDB 的强大功能，我们建议您深入阅读我们的文档，了解更多高级特性和最佳实践。