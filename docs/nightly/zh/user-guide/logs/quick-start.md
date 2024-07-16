# 快速开始


## 下载并安装 GreptimeDB & 启动 GreptimeDB

请遵循[安装指南](/getting-started/overview.md) 来安装并启动 GreptimeDB。

## 创建 Pipeline

GreptimeDB 提供了专门的 HTTP 接口用于创建 Pipeline，具体操作如下：

首先创建一个 Pipeline 文件，例如 `pipeline.yaml`。

```yaml
# pipeline.yaml
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
      - logger
    type: string
    index: tag
  - fields:
      - log
    type: string
    index: fulltext
  - field: time
    type: time
    index: timestamp

然后执行以下命令上传配置文件：

```shell
## 上传 pipeline 文件。test 为 Pipeline 的名称
curl -X "POST" "http://localhost:4000/v1/events/pipelines/test" -F "file=@pipeline.yaml"
```

该命令执行成功后，会创建了一个名为 `test` 的 Pipeline，并返回结果：`{"name":"test","version":"2024-06-27 12:02:34.257312110Z"}`。
其中 `name` 为 Pipeline 名称，`version` 为 Pipeline 版本号。

此 Pipeline 包含一个 Processor 和三个 Transform。Processor 使用了 Rust 的时间格式化字符串 `%Y-%m-%d %H:%M:%S%.3f` 解析日志中的 timestamp 字段，然后 Transform 将 id1 和 id2 字段转换为 int32 类型，将 level、content、logger 字段转换为 string 类型，最后将 timestamp 字段转换为时间类型，并将其设置为 Timestamp 索引。

请参考 [Pipeline 介绍](pipeline-config.md)查看具体的语法。



## 查询 Pipeline

可以使用 SQL 查询保存在数据库中的 pipeline 内容，请求示例如下：

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
      |        |              |       - logger                   +|
      |        |              |     type: string                 +|
      |        |              |     index: tag                   +|
      |        |              |   - fields:                      +|
      |        |              |       - log                      +|
      |        |              |     type: string                 +|
      |        |              |     index: fulltext              +|
      |        |              |   - field: time                  +|
      |        |              |     type: time                   +|
      |        |              |     index: timestamp             +|
      |        |              |                                   |
(1 row)
```

## 写入日志

可以使用 HTTP 接口写入日志，请求示例如下：

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

上面的例子中，我们向 `public.logs` 表中成功写入了 4 条日志。

请参考[配合 Pipeline 写入日志](write-logs.md)获取具体的日志写入语法。

## `logs` 表结构

我们可以使用 SQL 查询来查看 `public.logs` 表的结构。

```sql
DESC TABLE logs;
```

查询结果如下：

```sql
 Column |        Type         | Key | Null | Default | Semantic Type
--------+---------------------+-----+------+---------+---------------
 id1    | Int32               |     | YES  |         | FIELD
 id2    | Int32               |     | YES  |         | FIELD
 type   | String              | PRI | YES  |         | TAG
 logger | String              | PRI | YES  |         | TAG
 log    | String              |     | YES  |         | FIELD
 time   | TimestampNanosecond | PRI | NO   |         | TIMESTAMP
(6 rows)
```

从上述结果可以看出，根据 Pipeline 处理后的结果，`public.logs` 表包含了 6 个字段：id1 和 id2 都被转换为 int32 类型，type、log、logger 都被转换为 string 类型，time 被转换为时间戳类型，并且设置为 Timestamp 索引。

## 查询日志

就像任何其他数据一样，我们可以使用标准 SQL 来查询日志数据。

```shell
# 使用 MySQL 或者 PostgreSQL 协议连接 GreptimeDB

# mysql
mysql --host=127.0.0.1 --port=4002 public

# postgresql
psql -h 127.0.0.1 -p 4003 -d public
```

可通过 SQL 查询日志表：

```sql
SELECT * FROM public.logs WHERE MATCHES(log, 'sendTextDataToCluster');
```

查询结果如下：

```sql

 id1  | id2  | type |      logger      |                    log                     |            time
------+------+------+------------------+--------------------------------------------+----------------------------
 2436 | 2528 | I    | INTERACT.MANAGER | ClusterAdapter:enter sendTextDataToCluster+| 2024-05-25 20:16:37.217000
      |      |      |                  |                                            |
 2436 | 2528 | I    | INTERACT.MANAGER | ClusterAdapter:enter sendTextDataToCluster+| 2024-05-25 20:16:37.217000
      |      |      |                  |                                            |
 2436 | 2528 | I    | INTERACT.MANAGER | ClusterAdapter:enter sendTextDataToCluster+| 2024-05-25 20:16:37.217000
      |      |      |                  |                                            |
 2436 | 2528 | I    | INTERACT.MANAGER | ClusterAdapter:enter sendTextDataToCluster+| 2024-05-25 20:16:37.217000
      |      |      |                  |                                            |
(4 rows)
```

可以看出，通过 Pipeline 将 Log 进行类型转换后存储为结构化的日志，为日志的进一步查询和分析带来了便利。
请参阅[查询日志](query-logs.md)以了解查询日志的具体语法。

## 结语

通过以上步骤，您已经成功创建了 Pipeline，写入日志并进行了查询。这只是 GreptimeDB 提供功能的冰山一角。
接下来请继续阅读 [Pipeline 配置](pipeline-config.md)和[管理 Pipeline](manage-pipelines.md) 来了解更多高级特性和最佳实践。