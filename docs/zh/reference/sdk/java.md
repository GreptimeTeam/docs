# Java SDK

兼容 GreptimeDB 协议且轻量级的 Java 客户端。

## 特点

- 基于 SPI 的可扩展网络传输层,使用 gRPC 框架提供默认实现
- 易于使用的非阻塞、纯异步 API
- 默认自动收集各种性能指标，用户可以配置它们并写入本地文件
- 用户可以对关键对象进行内存快照，配置它们并写入本地文件，这对于解决复杂问题非常有助益

## 如何使用

请参考用户指南章节，了解如何 [安装 SDK](/user-guide/clients/sdk-libraries/java.md), [写入数据](/user-guide/write-data/sdk-libraries/java.md)和[查询数据](/user-guide/query-data/sdk-libraries/java.md)。

## 全局配置 (System properties / Java -Dxxx)

| 属性                                           | 描述                                                                                                                                                        |
|:-----------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| greptimedb.use\_os\_signal                     | 是否使用 OS Signal。SDK 会默认监听 SIGUSR2 信号并输出一些信息，这对解决复杂问题非常有帮助。 |
| greptimedb.signal.out\_dir                     | 指定 signal handler 的输出目录，默认是进程启动目录。                                                                      |
| greptimedb.available\_cpus                     | 指定可用 cpu 数量，默认使用当前环境的全部 cpu 数量。                                                  |
| greptimedb.reporter.period\_minutes            | Metrics Reporter 定时输出周期，默认 30 分钟。                                                                                       |
| greptimedb.read.write.rw\_logging               | 每次读写操作是否打印日志，默认关闭。                                                                                                 |                                                                                                          |

## 指标与显示

在运行时，用户可以使用 Linux 平台的 SIGUSR2 信号来输出节点的状态信息（显示）和指标。

### 如何设置

```shell
kill -s SIGUSR2 pid
```

将相关信息输出到指定目录。

默认情况下，在程序工作目录下生成 2 个文件
（cwd：`lsof -p $pid | grep cwd`）

- greptimedb\_client\_metrics.log.xxx：记录当前客户端节点的所有 metrics 信息
- greptimedb\_client\_display.log.xxx：记录当前客户端的重要内存状态信息

### 指标列表 (持续更新)

| Name                                                            | Description                                                                                                                    |
|:----------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------|
| thread\_pool.${thread\_pool\_name} [timer]                      | 线程池执行任务时间统计。                                                                                   |
| scheduled\_thread\_pool.${schedule\_thread\_pool\_name} [timer] | 调度线程池执行任务时间统计。                                                                          |
| async\_write\_pool.time [timer]                                 | SDK 中异步写任务的异步池时间统计，这个很重要，建议重点关注。 |
| async\_read\_pool.time [timer]                                  | SDK 中异步读任务的异步池时间统计，这个很重要，建议重点关注。  |
| write\_rows\_success\_num [histogram]                           | 成功写入次数的统计。                                                                                 |
| write\_rows\_failure\_num [histogram]                           | 失败写入的数据条目数。                                                                 |
| write\_failure\_num [meter]                                     | 写入失败次数统计。 writes.                                                                                     |
| write\_qps [meter]                                              | 写请求 QPS                                                                                                            |
| write\_by\_retries\_${n} [meter]                                | 第 n 次重试写入的 QPS，第一次写入（非重试）n == 0，n > 3 将被计为n == 3                           |
| read\_rows\_num [histogram]                                     | 每次查询的数据项数量统计。                                                                             |
| read\_failure\_num [meter]                                      | 失败查询的数量统计。                                                                                     |
| serializing\_executor\_single\_task\_timer\_${name} [timer]     |  序列化执行器。单任务执行时间消耗统计                                                        |
| serializing\_executor\_drain\_timer\_${name} [timer]            |  序列化执行器。Drains all tasks 的耗时统计                                                          |
| serializing\_executor\_drain\_num\_${name} [histogram]          |  序列化执行器。Draining tasks 的数量统计                                                               |

## 魔法工具

### 如何使用 `kill -s SIGUSR2 $pid`

当你第一次运行 `kill -s SIGUSR2 $pid` 时会看到日志输出的帮助信息，包括:

- 打开/关闭读写日志的压缩版本的输出。
- 打开/关闭限制器
- 将重要对象的内存指标和内存状态信息导出到本地文件

### 跟随帮助信息操作

``` text
 - -- GreptimeDBClient Signal Help --
 -     Signal output dir: /Users/xxx/xxx
 -
 -     How to open or close read/write log(The second execution means close):
 -       [1] `cd /Users/xxx/xxx`
 -       [2] `touch rw_logging.sig`
 -       [3] `kill -s SIGUSR2 $pid`
 -       [4] `rm rw_logging.sig`
 -
 -     How to get metrics and display info:
 -       [1] `cd /Users/xxx/xxx`
 -       [2] `rm *.sig`
 -       [3] `kill -s SIGUSR2 $pid`
 -
 -     The file signals that is currently open:
 -       rw_logging.sig
 -
```

## 使用示例

完全可运行的代码片段和常用方法的解释，请参见[使用示例](https://github.com/GreptimeTeam/greptimedb-client-java/tree/main/greptimedb-example/src/main/java/io/greptime/example).

## API

请参考 [API 文档](https://javadoc.io/doc/io.greptime/greptimedb-protocol/latest/index.html).
