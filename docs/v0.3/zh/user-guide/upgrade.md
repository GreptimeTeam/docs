# Upgrade

从 `v0.4` 开始，我们提供了一个内置的工具来帮助您将以前的 GreptimeDB 部署升级到最新版本。
如果不同版本之间有 Breaking Change，我们都建议使用此方法在不同版本的 GreptimeDB 之间进行迁移升级。

此工具可以将 `v0.3.0` 以上的版本升级到最新版本。

## CLI

该工具在 `greptime` 二进制文件中。在开始之前，您需要准备目标版本的二进制文件。

```shell
greptime cli export --help
```

帮助文档如下：

```shell
greptime-cli-export 

USAGE:
    greptime cli export [OPTIONS] --addr <ADDR> --output-dir <OUTPUT_DIR> --target <TARGET>

OPTIONS:
        --addr <ADDR>                  Server address to connect
        --database <DATABASE>          The name of the catalog to export. Default to "greptime-*""
                                       [default: ]
    -h, --help                         Print help information
    -j, --export-jobs <EXPORT_JOBS>    Parallelism of the export [default: 1]
        --max-retry <MAX_RETRY>        Max retry times for each job [default: 3]
        --output-dir <OUTPUT_DIR>      Directory to put the exported data. E.g.:
                                       /tmp/greptimedb-export
    -t, --target <TARGET>              Things to export [possible values: create-table, table-data]
```

这里解释一些重要选项的含义：

- `-addr`：Frontend 节点或者 Standalone 进程的 gRPC 地址。
- `-output-dir`：要放置导出数据的目录。需要是当前机器上的路径。导出的 SQL 文件将放在该目录中。
- `-target`：要导出的内容。`create-table` 可以导出每个表的 `CREATE TABLE` 语句。`table-data` 可以导出每个表的数据以及对应的 `COPY FROM` 语句。

对于完整的升级，您需要使用每个目标选项两次执行此工具。
