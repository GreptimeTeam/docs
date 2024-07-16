# Rule Management

With this service, you can easily set up alerting and recording rules by copying your Prometheus configuration files to GreptimeCloud. Furthermore, the visualized charts will be generated automatically in the console, providing a seamless experience for monitoring your applications. You can visit [Prometheus](https://prometheus.io/docs/prometheus/latest/configuration/configuration) for more details about the configuration files.

## Manage rule files via Git

Each GreptimeCloud service comes with a Git repository for storing prometheus rules and configurations. By checking your rules, GreptimeCloud's prometheus-compatible rule engine evaluates your rules against data stored in the database and emits alert when matches.

::: tip NOTE
Creating branch or tag is disabled in the Git repository
:::

### Download Template

You can get the clone URL of the repository in the [GreptimeCloud console](https://console.greptime.cloud/service/list).

```shell
git clone <cloud-repo-url>
```

### Files

You can see the following files in the repository.

```shell
.
├── README.md
└── prometheus.yml
```

You can add or edit files locally. Only the following files are allowed:

- prometheus.yml
- README.md
- `<your rules>` YAML files

#### `prometheus.yml`

The `prometheus.yml` file is responsible for managing global and alerting settings. Please **do not** change its name. The supported fields are listed below. Any other fields will be discarded.

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

#### Rule Files

You can add rule configurations in custom `.yml` files at the root directory. Suppose you have a rule file named `alert.yml` and with the following content:

```yaml
groups:
  - name: example
    rules:
    - record: code:prometheus_http_requests_total:sum
      expr: sum by (code) (prometheus_http_requests_total)
```

The files in the directory should be as following:

```shell
.
├── README.md
├── alert.yml
└── prometheus.yml
```

You can add as many rule files as you want.

#### Restrictions

- Each file is 1MB limited, and total repo is 100MB limited
- Each file MUST be valid rule yaml format
- Creating directory is disabled

### Push Code

After adding or copying your Prometheus configuration files into this repository, you can push them to GreptimeCloud.

```shell
git add .
```

```shell
git commit -m "sync prometheus configuration"
```

```shell
git push
```

### Pull Code

In addition to editing the configuration files through Git, you can also make changes to them via the [GreptimeCloud console](#visualize-data). Then you can pull the latest configuration files.

```shell
git pull
```

## Visualize Data

After pushing your Prometheus configuration files to GreptimeCloud, visit the [GreptimeCloud console](https://console.greptime.cloud/service/list) and navigate to the `Prometheus Workbench`. You can see the charts generated automatically based on your configuration files.

<!-- TODO: Image waiting for dashboard production version -->

You can also add a new rule or edit the exist rules via the console. The changes will be automatically pushed to the repository.
