# 配置 GreptimeDB

GreptimeDB 提供了层次化的配置能力，按照下列优先顺序来生效配置：

- 命令行配置选项
- 配置文件选项
- 环境变量
- 默认值

对于没有配置的参数，GreptimeDB 会赋予其一个默认值。

## 命令行选项

请阅读[命令行工具](/reference/command-lines.md)学习如何使用 `greptime` 命令行工具。

## 配置文件

配置可以被写入到 TOML 文件中。

### 指定配置文件

用户可以通过使用命令行参数 `-c [file_path]` 指定配置文件。

```sh
greptime [standalone | frontend | datanode | metasrv]  start -c config/standalone.example.toml
```

例如，启动 standalone 模式：

```bash
greptime standalone start -c standalone.example.toml
```

### 选项

请访问 GitHub 上的[所有可用配置](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/config.md)。

### 示例

下面是包含了所有可用的配置的 GreptimeDB 组件的示例配置文件。
在实际业务场景中，你仅需配置需要的选项即可，不需要像示例文件一样配置所有选项。

- [standalone](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/standalone.example.toml)
- [frontend](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/frontend.example.toml)
- [datanode](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/datanode.example.toml)
- [flownode](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/flownode.example.toml)
- [metasrv](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/metasrv.example.toml)

## 环境变量配置

配置文件中的每一项都可以映射到环境变量。例如，如果我们想通过环境变量设置 datanode 的配置项 `data_home`：

```toml
# ...
[storage]
data_home = "/data/greptimedb"
# ...
```

你可以使用以下的 shell 命令来设置环境变量，格式如下：

```
export GREPTIMEDB_DATANODE__STORAGE__DATA_HOME=/data/greptimedb
```

### 环境变量规则

- 每个环境变量应该有组件前缀，例如：

  - `GREPTIMEDB_FRONTEND`
  - `GREPTIMEDB_METASRV`
  - `GREPTIMEDB_DATANODE`
  - `GREPTIMEDB_STANDALONE`

- 我们使用**双下划线 `__`** 作为分隔符。例如，上述的数据结构 `storage.data_home` 将被转换为 `STORAGE__DATA_HOME`。

环境变量也接受用逗号 `,` 分隔的列表，例如：

```
GREPTIMEDB_METASRV__META_CLIENT__METASRV_ADDRS=127.0.0.1:3001,127.0.0.1:3002,127.0.0.1:3003
```
