# 规则管理

通过此服务，你可以通过将你的 Prometheus 配置文件复制到 GreptimeCloud 中轻松设置警报和记录规则。此外，可视化的图表将在控制台中自动生成，这些为监视应用程序提供了无缝体验。你可以访问 [Prometheus](https://prometheus.io/docs/prometheus/latest/configuration/configuration) 了解有关配置文件的更多详细信息。

## 通过 Git 管理规则文件

每个 GreptimeCloud 服务都带有一个 Git 仓库，用于存储 Prometheus 的规则和配置。GreptimeCloud 的 Prometheus 兼容规则引擎会根据存储在数据库中的数据适配你的规则，并在匹配时发出警报。

::: tip 注意
Git 仓库中禁止创建分支或标签
:::

### 下载模板

你可以在 [GreptimeCloud 控制台](https://console.greptime.cloud/service) 中获取仓库的 clone URL。

```shell
git clone <cloud-repo-url>
```

### 文件

在仓库中你可以看到这些文件：

```shell
.
├── README.md
└── prometheus.yml
```

你可以在本地添加或修改文件，仅这些文件被允许使用：

- prometheus.yml
- README.md
- `<your rules>` YAML files

#### `prometheus.yml`

`prometheus.yml` 文件负责管理全局和警报设置，请**不要更改**文件名称。文件内支持的字段如下所示，其他字段都会被丢弃：

```yaml
global:
  [ evaluation_interval: <duration> | default = 1m ]

  external_labels:
    [ <labelname>: <labelvalue> ... ]

alerting:
  alert_relabel_configs:
    [ - <relabel_config> ... ]

  alertmanagers:
    [ - <alertmanager_config> ... ]
```

#### 规则文件

你可以在根目录下添加自定义的 `.yml` 文件来添加规则配置。假设你有一个名为 `alert.yml` 的规则文件，其内容如下：

```yaml
groups:
  - name: example
    rules:
    - record: code:prometheus_http_requests_total:sum
      expr: sum by (code) (prometheus_http_requests_total)
```

该文件在目录中的位置如下：

```shell
.
├── README.md
├── alert.yml
└── prometheus.yml
```

你可以添加任意数量的规则文件。

#### 限制

- 每个文件限制为 1MB，总仓库限制为 100MB
- 每个文件必须是有效的 `yaml` 格式
- 禁止创建目录

### 推送代码

在将 Prometheus 配置文件添加或复制到此仓库后，你可以将它们推送到 GreptimeCloud。

```shell
git add .
```

```shell
git commit -m "sync prometheus configuration"
```

```shell
git push
```

### 拉取代码

除了通过 Git 编辑配置文件外，你还可以通过 [GreptimeCloud 控制台](#可视化数据) 对规则进行更改。
通过下方的命令即可拉取最新的配置文件：

```shell
git pull
```

## 可视化数据

将 Prometheus 配置文件推送到 GreptimeCloud 后，访问 [GreptimeCloud 控制台](https://console.greptime.cloud/service)，并点击 `Prometheus Workbench`。你可以看到基于你的配置文件自动生成的图表。

<!-- TODO: Image waiting for dashboard production version -->

你还可以通过控制台添加新规则或编辑现有规则，这些更改将自动推送到仓库中。
