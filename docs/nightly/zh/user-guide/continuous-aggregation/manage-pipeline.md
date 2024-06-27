# 管理 Pipeline

每一个 `pipeline` 是 GreptimeDB 中的一个数据变换单元，他用于拆分转换写入的 log 内容。
本文档描述了如何创建、删除一个 Pipeline。

## 简介

Pipeline 是由一个 Pipeline name 和 Pipeline 的配置组成的。 Pipeline 的配置为 Yaml 格式，包含了 Pipeline 的数据转换规则。
在 log 写入时，GreptimeDB 会根据 Pipeline 的配置将 log 内容进行格式转换，数据拆分等多个操作，并将转换后的结果写入到对应的表中。方便后续进行结构化查询。

## 创建 Pipeline

我们提供了专门的 http 接口进行 Pipeline 的创建，接口如下：

```shell
## test 为 Pipeline 的名称
curl -X "POST" "http://localhost:4000/v1/events/pipelines/test" \
     -H 'Content-Type: application/x-yaml' \
     -d $'processors:
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
```

<!-- FIXME (qtang): 编写 Pipeline 语法文档，并在此处超链 placeholder -->

上面的例子中，我们创建了一个名为 `test` 的 Pipeline，其中包含了一个 Processor 和三个 Transform。它将先对 log 中的 time 字段按照 Rust 时间格式化字符串 `%Y-%m-%d %H:%M:%S%.3f` 对时间进行解析，然后将 id1 和 id2 字段转换为 int32 类型，type、log、logger 字段转换为 string 类型，最后将 time 字段转换为时间类型，并将其设置为 timestamp 索引。请注意。**此处仅作为展示。具体的 Pipeline 语法请参考 placeholder。**

此接口的返回值为创建的 Pipeline 的名称和版本号，例如 `{"name":"test","version":"2024-06-19 09:24:55.788204038Z"}` 版本号用精度为纳秒的时间字符串表示。

## 删除 Pipeline

我们提供了专门的 http 接口进行 Pipeline 的删除，接口如下：

```shell
## test 为 Pipeline 的名称
curl -X "DELETE" "http://localhost:4000/v1/events/pipelines/test"
```

上面的例子中，我们删除了一个名为 `test` 的 Pipeline。

## 查询 Pipeline

目前 nightly 版本的 GreptimeDB 还不支持 http 查询 Pipeline 的功能。我们后续会增加相关接口以便您可以更好的获取 Pipeline 信息。目前仅可以使用 sql 形式来查询 Pipeline 的信息。

<!-- ```sql
SELECT * FROM greptime_private.pipelines;
``` -->

__请注意，如果您使用 mysql 或者 postgresql 协议作为连接 GreptimeDB 的方式，查询出来的 Pipeline 时间信息精度可能有所不同。可能会丢失纳秒级别的精度。__
请通过

<!-- ```sql
SELECT name,pipeline,ts::bigint FROM greptime_private.pipelines;
``` -->

来获取 Pipeline 的纳秒时间戳，然后在转换为 `%Y-%m-%d %H:%M:%S%.fZ` 格式的时间戳。