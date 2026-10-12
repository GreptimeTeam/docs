---
keywords: [GreptimeDB, export-v2, import-v2, 备份, 恢复, 快照, 迁移, S3, MinIO]
description: 介绍如何使用 export-v2 和 import-v2 CLI 命令导出、验证、管理和导入 GreptimeDB 快照。
---

# 使用 Export/Import V2 导出和导入数据

Export/Import V2 会创建可移植的 GreptimeDB 数据快照。你可以使用它备份数据、恢复数据，或在 GreptimeDB 实例之间迁移数据。

Export/Import V2 快照包含 schema 元数据、manifest 和数据文件。数据文件会被拆分为 chunks，因此中断的导出和导入任务可以从之前的进度继续执行。

本指南使用以下命令：

- `greptime cli data export-v2 create`：创建快照
- `greptime cli data export-v2 verify`：验证快照
- `greptime cli data export-v2 list`：列出父路径下的快照
- `greptime cli data export-v2 delete`：删除快照
- `greptime cli data import-v2`：从快照导入数据

## 前置条件

使用 Export/Import V2 之前，请确认：

- GreptimeDB HTTP endpoint 可访问，例如 `127.0.0.1:4000`。
- 你的 `greptime` binary 包含 `cli data export-v2` 和 `cli data import-v2` 命令。
- CLI client 和 GreptimeDB server 都能读写快照存储位置。

对于远程对象存储，仅有快照 URI 还不够。你还需要显式启用一个受支持的存储后端，并传入该后端的连接选项。Export/Import V2 支持 S3-compatible 存储、阿里云 OSS、Google Cloud Storage 和 Azure Blob Storage。例如，对于 S3-compatible 存储，需要同时使用 `--s3` 和 `--s3-region`。

对于 `file://` 快照，路径必须同时能被 GreptimeDB server 和 CLI client 访问。通常这意味着 CLI 与 standalone server 运行在同一台主机上，或者将同一个文件系统路径挂载到 GreptimeDB server 中。创建快照之前，快照的父目录必须已经存在。对于远程、Kubernetes 或分布式部署，请使用 S3 或 MinIO 等对象存储，而不是本地 `file://` 路径。

GreptimeDB server 通过 `COPY DATABASE ... TO` 写入快照数据文件，因此 `file://` 快照路径还必须位于 server 的 copy root 内，即 `storage.copy_root`，默认为 `<storage.data_home>/copy`。位于 copy root 之外的路径会被 server 拒绝。对象存储快照不受 copy root 限制，因为 server 会直接把数据写入对象存储。详情请参阅[迁移本地 SQL 文件访问](/user-guide/deployments-administration/migrate-local-sql-file-access.md)。

:::note

快照 URI（例如 `s3://my-bucket/snapshots/prod`）标识快照位置，其中包括 bucket。对象存储选项（例如 `--s3-region` 和 `--s3-endpoint`）配置 CLI 如何连接到对应后端。`--s3-bucket` 和 `--s3-root` 不会改变快照的读写位置，以 URI 为准。请在 create、verify、import、list 和 delete 命令中传入相同的连接选项。

:::

## 使用本地文件系统快速开始

只有在 CLI client 和 GreptimeDB server 共享同一路径时，才应使用本地文件系统快照。例如，对于本地 standalone server，如果 CLI 在同一台主机上运行，这种方式可以工作。

本指南中的示例把快照存放在 `/tmp/greptime-snapshots` 下。请在 GreptimeDB 配置文件中把该目录设置为 server 的 copy root，然后重启 server：

```toml
[storage]
copy_root = "/tmp/greptime-snapshots"
```

也可以保留默认的 copy root，改用 `<storage.data_home>/copy` 下的快照路径，例如 `file:///path/to/data_home/copy/demo`。

创建父目录，并确保 server 和 CLI 都能访问它：

```bash
mkdir -p /tmp/greptime-snapshots
```

创建快照：

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to file:///tmp/greptime-snapshots/demo
```

恢复之前先验证快照：

```bash
greptime cli data export-v2 verify \
  --snapshot file:///tmp/greptime-snapshots/demo
```

从快照导入：

```bash
greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from file:///tmp/greptime-snapshots/demo
```

默认情况下，导出和导入使用 `greptime` catalog。如果需要使用其他 catalog，请添加 `--catalog <catalog>`。

## 导出到远程对象存储

Export/Import V2 可以将快照存储到 AWS S3、MinIO 等 S3-compatible 服务、阿里云 OSS、Google Cloud Storage 和 Azure Blob Storage。下面的示例使用 S3 backend，因为 S3 和 MinIO 是常见选择。对于其他对象存储，请使用 [支持的存储后端](#支持的存储后端) 中对应的 backend flag 和选项。

### S3 或 MinIO

对于 AWS S3 以及 MinIO 等 S3-compatible 服务，请使用 S3 backend。

### S3-compatible endpoint

对于 MinIO，请传入 `--s3-endpoint`。运行以下示例前，请在 shell 中将 `S3_ACCESS_KEY_ID` 和 `S3_SECRET_ACCESS_KEY` 设置为有权访问 bucket 的凭证：

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to s3://greptime/snapshots/local-test \
  --s3 \
  --s3-bucket greptime \
  --s3-region us-west-2 \
  --s3-access-key-id "${S3_ACCESS_KEY_ID}" \
  --s3-secret-access-key "${S3_SECRET_ACCESS_KEY}" \
  --s3-endpoint http://127.0.0.1:9000
```

验证、导入、列出或删除快照时，也需要使用相同的存储选项：

```bash
greptime cli data export-v2 verify \
  --snapshot s3://greptime/snapshots/local-test \
  --s3 \
  --s3-bucket greptime \
  --s3-region us-west-2 \
  --s3-access-key-id "${S3_ACCESS_KEY_ID}" \
  --s3-secret-access-key "${S3_SECRET_ACCESS_KEY}" \
  --s3-endpoint http://127.0.0.1:9000
```

```bash
greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from s3://greptime/snapshots/local-test \
  --s3 \
  --s3-bucket greptime \
  --s3-region us-west-2 \
  --s3-access-key-id "${S3_ACCESS_KEY_ID}" \
  --s3-secret-access-key "${S3_SECRET_ACCESS_KEY}" \
  --s3-endpoint http://127.0.0.1:9000
```

对于 AWS S3，请使用相同的 `--s3` 选项；除非使用自定义 endpoint，否则不要传 `--s3-endpoint`。如果你的环境使用 instance profile 或其他凭据提供机制，可能不需要显式传入 access key。S3 backend 仍然需要 `--s3` 和 `--s3-region`。

## 使用实验性的 Metric packed 快照

当 Metric 逻辑表数量多、单表数据量小时，packed 导出可减少重复扫描和对象存储请求。它将独立的 Parquet 数据流打包到共享对象中，每张逻辑表仍保留自己的 schema。较大的逻辑表和普通表使用独立 Parquet 对象。收益取决于工作负载和存储延迟，打包也可能增加内存使用。

该功能仍处于实验阶段，默认关闭。请使用支持 packed 快照的 Nightly CLI 和服务端。在源端 standalone 配置中，或 CLI 所用入口背后所有源端 frontend 的配置中，添加以下**顶层**选项，然后重启对应服务：

```toml
experimental_metric_export = true
```

通过源端入口执行以下 SQL 检查：

```sql
SHOW VARIABLES experimental_metric_export;
```

结果必须为 `true`。创建 packed 快照前，CLI 还会检查服务端是否支持 packed 导出。负载均衡后的各个 frontend 必须保持版本和配置一致；某个 frontend 检查通过，并不代表其他 frontend 也已升级或启用该功能。

按快速开始配置好本地 copy root 后，同时传入两个 CLI 选项，导出 `public` schema：

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to file:///tmp/greptime-snapshots/metric-packed \
  --schemas public \
  --experimental-metric-export \
  --metric-data-layout packed
```

使用 S3 或 MinIO 时，在[远程导出示例](#s3-compatible-endpoint)中加入相同的两个选项，并使用新的快照前缀。存储选项和 copy root 要求不变。packed 导出仅支持 Parquet（`--format` 的默认值）；CSV 和 JSON 需使用普通导出。`--metric-data-layout packed` 必须与 `--experimental-metric-export` 一起使用。仅传入实验性选项会启用 Metric 共享扫描，但仍写入独立文件。

验证和导入沿用已有命令；导入会根据 manifest 选择布局，无需额外的 packed 选项：

```bash
greptime cli data export-v2 verify \
  --snapshot file:///tmp/greptime-snapshots/metric-packed

greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from file:///tmp/greptime-snapshots/metric-packed
```

迁移时，将导入命令的 `--addr` 替换为目标端入口。目标端必须支持 packed 导入，但无需开启导出配置开关。若目标端缺少 packed 导入能力，导入会在执行目标端 DDL 或写入数据前停止，不会自动转换为普通导入。当目标端支持批量创建逻辑表时，`import-v2` 会自动使用该能力；否则按顺序执行普通 DDL，packed 快照也适用。批量请求提交后若失败，导入会停止，不会自动回退或重放。

### 快照版本兼容性

命令名中的 `v2` 与 manifest 版本是两个概念：

| 导出方式 | Manifest 版本 | 数据布局 |
| --- | --- | --- |
| 默认导出 | 1 | 独立文件 |
| 仅使用 `--experimental-metric-export` | 1 | 独立 Parquet 文件 |
| 同时使用上述两个 Metric 选项 | 2 | 带索引的 packed 和独立 Parquet 对象 |
| `--schema-only` | 1 | 无数据文件 |

新 importer 可读取 manifest v1 和 v2。仅支持 manifest v1 的旧 importer 会在执行目标端 DDL 前拒绝 v2。恢复 packed 快照前，请先升级 importer 和目标服务端。续传会保留原有 manifest 版本和布局，不会把已有快照转换为 packed 格式。

## 导出指定 schemas

默认情况下，`export-v2 create` 会导出除 `information_schema` 之外的所有 schema，其中包括 `greptime_private` schema，导入这样的快照时也会一并恢复 `greptime_private`。如果要排除它，请使用 `--schemas` 显式列出需要导出的 schemas。

使用 `--schemas` 只导出指定 schemas。可以传入逗号分隔的列表：

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to file:///tmp/greptime-snapshots/observability \
  --schemas public,metrics
```

也可以多次传入该选项：

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to file:///tmp/greptime-snapshots/observability \
  --schemas public \
  --schemas metrics
```

导入时，`--schemas` 会从快照中选择一个子集：

```bash
greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from file:///tmp/greptime-snapshots/observability \
  --schemas public
```

如果请求的 schema 不存在于快照中，导入会失败。

## 只导出 schema

使用 `--schema-only` 导出表定义，不导出数据：

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to file:///tmp/greptime-snapshots/schema-only \
  --schema-only
```

导入 schema-only 快照会恢复 schema，但不会导入数据 chunks：

```bash
greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from file:///tmp/greptime-snapshots/schema-only
```

## 选择数据文件格式

使用 `--format` 选择数据文件格式。支持的值为 `parquet`、`csv` 和 `json`，默认值为 `parquet`。

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to file:///tmp/greptime-snapshots/demo-csv \
  --format csv
```

格式会记录在快照的 manifest 中。`import-v2` 会从 manifest 中读取格式并自动应用，因此导入时不需要再次指定格式。

## 按时间范围和 chunk window 导出

对于大数据集，请使用有界时间范围和 chunk window。Export/Import V2 会为范围内的每个 schema 创建一个或多个数据 chunks。

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to s3://greptime/snapshots/prod-2026-06 \
  --start-time 2026-06-01T00:00:00Z \
  --end-time 2026-07-01T00:00:00Z \
  --chunk-time-window 1d \
  --s3 \
  --s3-bucket greptime \
  --s3-region us-west-2 \
  --s3-access-key-id "${S3_ACCESS_KEY_ID}" \
  --s3-secret-access-key "${S3_SECRET_ACCESS_KEY}" \
  --s3-endpoint http://127.0.0.1:9000
```

`--chunk-time-window` 需要同时指定 `--start-time` 和 `--end-time`。

Chunks 会按时间窗口创建。例如，15 分钟的范围配合 `--chunk-time-window 5m` 会创建 3 个 chunks。导入时，数据任务按 chunk 和 schema 调度。如果快照包含 3 个 chunks，且有 2 个 schema 包含数据，则导入会调度 6 个数据任务。

默认的独立文件布局按 schema 和 chunk 组织数据文件。例如，一个多 chunk 快照可能包含如下路径：

```text
data/logs/1/app_logs.parquet
data/logs/2/app_logs.parquet
data/logs/3/app_logs.parquet
data/public/1/host_metrics.parquet
data/public/2/host_metrics.parquet
data/public/3/host_metrics.parquet
```

请根据数据量和数据密度选择 chunk window：

- 对于较小或稀疏的数据集，使用更大的 window，避免产生太多小 chunks。
- 对于较大的数据集，使用更小的 window，让每个 chunk 保持在可管理的大小。
- 可以先从 `1d` 开始，再根据导出耗时和 chunk 大小调整。

## 调整并行度

导出有两个并行度选项：

- `--parallelism` 控制每个 schema、每个 chunk 上 server-side `COPY DATABASE` 的并行度。默认值为 `1`。
- `--chunk-parallelism` 控制 client 同时运行多少个 export chunks。默认值为 `1`，有效范围是 `1..=64`。

导入使用：

- `--task-parallelism` 控制 client 同时运行多少个 import data tasks。默认值为 `1`，有效范围是 `1..=64`。

请逐步提高这些值，并监控 GreptimeDB、对象存储和网络资源使用情况。

## 恢复中断的导出或导入

Export/Import V2 设计上支持恢复中断的工作。

:::warning

HTTP 超时或 CLI 退出，并不代表服务端请求或存储写入已经停止。在续传、清理未完成输出或使用 `--force` 前，必须确认原导出/导入请求及其写入已经结束。不要对同一快照或恢复目标并发重试。

:::

对于导出：

- 如果目标快照不存在，`export-v2 create` 会创建它。
- 如果目标快照已存在，同一条命令会从已有进度继续执行。
- 已完成的 chunks 会被跳过。失败或 pending 的 chunks 会重试。
- 只有在你想删除已有快照并重新创建时，才使用 `--force`。

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to file:///tmp/greptime-snapshots/demo
```

确认上一次请求已经结束后，再次运行同一条命令即可继续。packed 导出需保留原命令中的 Metric 选项。重试只清理属于该导出的未完成输出，保留已完成的 chunks；未完成 chunk 中若存在意外文件，清理会失败。重试期间，源数据和 DDL 必须保持不变。

对于导入，导入运行时进度会保存在 state 文件中。默认情况下，state 文件位于 `~/.greptime/import_state`。如果希望使用显式的 state 文件位置，可以用 `--state-path` 覆盖：

```bash
greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from file:///tmp/greptime-snapshots/demo \
  --state-path /tmp/greptime-import-demo.state
```

`--dry-run` 不会创建 import state 文件。真正的导入如果失败或中断，会保留 state 文件，因此下一次运行可以恢复已完成的数据任务。导入成功后，import-v2 会自动删除 state 文件，因为已经没有需要恢复的剩余工作。相同前缀的 `.lock` 文件可能保留下来；它是锁文件，不是导入状态内容。

整个恢复过程不具备事务原子性。后续步骤失败时，之前的 DDL 批次和已写入的数据可能仍保留在目标端。完成状态按 schema/chunk 数据任务记录，不按逻辑表记录；重试未完成任务可能重放已经写入的行。若 DDL 阶段尚未完成，恢复时也可能重放之前的 DDL。请在重试前检查目标端状态。

如果需要从头恢复，先确认原请求已经结束并准备干净的目标端，再使用新的 `--state-path` 或删除旧 state 文件。仅更换 state 文件不会清除已部分恢复的数据。

## Dry-run 导入

使用 `--dry-run` 验证快照和导入计划，但不执行 DDL，也不导入数据：

```bash
greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from file:///tmp/greptime-snapshots/demo \
  --dry-run
```

Dry-run 适合在生产迁移或恢复前使用。

## 验证、列出和删除快照

验证快照：

```bash
greptime cli data export-v2 verify \
  --snapshot file:///tmp/greptime-snapshots/demo
```

`verify` 检查快照的结构和完整性。对于 packed 快照，还会检查 DDL 与索引中的表是否对应、对象引用、字节范围和对象长度。它不会逐值解码比对，也不提供完整的内容或校验和验证。请按恢复要求另行验证导入后的数据。

列出父路径下的快照，查看已完成 chunk 数量，以及根据 manifest 得出的状态（`complete`、`incomplete`、`schema-only` 或 `unsupported`）：

```bash
greptime cli data export-v2 list \
  --location file:///tmp/greptime-snapshots
```

删除快照：

```bash
greptime cli data export-v2 delete \
  --snapshot file:///tmp/greptime-snapshots/demo
```

对于非交互式删除，请传入 `--no-confirm`：

```bash
greptime cli data export-v2 delete \
  --snapshot s3://greptime/snapshots/local-test \
  --no-confirm \
  --s3 \
  --s3-bucket greptime \
  --s3-region us-west-2 \
  --s3-access-key-id "${S3_ACCESS_KEY_ID}" \
  --s3-secret-access-key "${S3_SECRET_ACCESS_KEY}" \
  --s3-endpoint http://127.0.0.1:9000
```

## 认证、超时、代理和进度

如果 GreptimeDB 实例启用了 basic authentication，请使用 `--auth-basic <username>:<password>` 传入凭据。

CLI 请求超时默认为 `60s`。可通过 `--timeout` 调整，例如 `--timeout 5m`，为数据任务预留足够时间。超时不代表请求已取消，重试前请遵循[恢复注意事项](#恢复中断的导出或导入)。

对于会连接 GreptimeDB HTTP endpoint 的命令，例如 `export-v2 create` 和 `import-v2`，可以使用 `--proxy` 设置 HTTP 代理，或使用 `--no-proxy` 禁用代理：

```bash
greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from file:///tmp/greptime-snapshots/demo \
  --no-proxy
```

长时间运行的 create 和 import 命令支持使用 `--progress` 控制进度输出：

- `auto`：在 TTY 上显示交互式进度条，否则输出进度日志。这是默认值。
- `always`：始终输出进度；在 TTY 上使用进度条，否则输出轻量日志。
- `never`：不输出进度。

## 支持的存储后端

Export/Import V2 支持本地文件系统快照和远程对象存储快照。

对于远程对象存储，请只启用一个 backend：

- `--s3`：用于 AWS S3 或 MinIO 等 S3-compatible 存储
- `--oss`：用于阿里云 OSS
- `--gcs`：用于 Google Cloud Storage
- `--azblob`：用于 Azure Blob Storage

常用 S3 选项如下：

| Option | Description |
| --- | --- |
| `--s3-bucket` | S3 bucket 名称。不影响快照位置，实际使用的是快照 URI 中的 bucket。 |
| `--s3-region` | S3 region。使用 S3 时必填。 |
| `--s3-access-key-id` | Access key ID。当环境提供凭据时可选。 |
| `--s3-secret-access-key` | Secret access key。当环境提供凭据时可选。 |
| `--s3-endpoint` | 自定义 S3-compatible endpoint，例如 MinIO endpoint。 |
| `--s3-enable-virtual-host-style` | 启用 virtual-hosted-style 请求。 |
| `--s3-disable-ec2-metadata` | 禁用 EC2 metadata service 凭据查找。 |

## 故障排除

### 无法连接到 `/v1/sql`

检查 GreptimeDB 是否正在运行，以及 `--addr` 是否指向 HTTP endpoint：

```bash
curl http://127.0.0.1:4000/health
```

### `file://` 路径位于 copy root 之外

如果 `export-v2 create` 返回类似下面的错误，说明快照路径位于 server 的 copy root 之外：

```text
Local filesystem path '/tmp/greptime-snapshots/demo/data/greptime_private/1/' is outside the configured copy root or is unsafe
```

请把 `storage.copy_root` 设置为包含该快照路径的目录，或者改用 `<storage.data_home>/copy` 下的快照路径。详情请参阅[迁移本地 SQL 文件访问](/user-guide/deployments-administration/migrate-local-sql-file-access.md)。

失败的运行会在磁盘上留下一个不完整的快照，`export-v2 verify` 会报告失败的 chunk。修正配置后，再次运行同一条 `export-v2 create` 命令即可继续；如果想重新创建快照，请传入 `--force`。

### `--chunk-time-window` 校验失败

`--chunk-time-window` 需要同时指定 `--start-time` 和 `--end-time`。请添加有界时间范围，或移除 `--chunk-time-window`。

### S3 或 MinIO 返回 `NoSuchBucket` 或 `NoSuchKey`

请检查：

- 快照 URI 中的 bucket 和路径是否正确。`--s3-bucket` 不会改变快照位置。
- 对于 MinIO 或其他 S3-compatible 服务，是否设置了 `--s3-endpoint`。如果没有设置，CLI 会把请求发往 `--s3-region` 对应的公有 AWS S3 endpoint，通常表现为长时间无响应或返回 `301`，而不是明确的配置错误。
- 凭据是否可以读写快照位置。
- create、verify、import、list 和 delete 命令是否传入了相同的存储选项。

### Import 意外跳过数据

Import 会从 state 文件恢复。如果之前的导入已经将任务标记为 completed，后续使用同一个 state identity 运行时可能会跳过这些任务。请为每次恢复操作使用显式的 `--state-path`，或在确认安全后删除旧 state 文件。

### 请求的 schema 不存在

在导入时使用 `--schemas` 时，请确认该 schema 存在于快照中。请先使用 `export-v2 verify`，并检查快照内容。

### 验证失败

不要导入验证失败的快照。快照可能不完整或已损坏。请使用同一条命令重新运行导出，以恢复缺失的 chunks；如果你确实想丢弃已有快照并重新创建，请使用 `--force`。

## 限制

- Export/Import V2 快照与 legacy export/import 输出不是同一种格式。
- 导出及续传期间，所选源数据和表定义必须保持稳定。这不是跨表或跨 chunk 的事务一致性在线备份。导入期间保持快照文件不变，并避免并发修改目标表。
- packed 快照只在同一 schema 和时间 chunk 内打包；列不同的逻辑表也可以共享对象。8 MiB 限制针对单次数据写入或 multipart part，并非整个 pack、对象或逻辑表的大小上限。
- Schema filter 的粒度是 schema-level。该命令不覆盖 table-level filter。
- Time-range chunking 面向时间序列数据设计。稀疏数据可能需要更大的 chunk window。
- Schema-only 快照不包含数据文件。
- 大规模迁移需要仔细调优 chunk window、并行度、对象存储吞吐和 GreptimeDB 资源。
