---
keywords: [Kubernetes, 部署, Helm Chart, 配置]
description: 常见 Helm Chart 配置项
---

# 常见 Helm Chart 配置项

对于每一个 Helm Chart，你都可以通过创建 `values.yaml` 来进行配置。当你需要应用配置时，你可以通过 `helm upgrade` 命令来应用配置：

```
helm upgrade --install ${release-name} ${chart-name} --namespace ${namespace} -f values.yaml
```

## GreptimeDB Cluster Chart

完整的配置项可参考 [GreptimeDB Cluster Chart](https://github.com/GreptimeTeam/helm-charts/tree/main/charts/greptimedb-cluster/README.md)。

### GreptimeDB 运行镜像配置 

顶层变量 `image` 用于配置集群全局的运行镜像，如下所示：

```yaml
image:
  # -- The image registry
  registry: greptime-registry.cn-hangzhou.cr.aliyuncs.com
  # -- The image repository
  repository: greptime/greptimedb
  # -- The image tag
  tag: "v0.13.2"
  # -- The image pull secrets
  pullSecrets: []
```

如果你想为集群中的每个 Role 配置不同的镜像，可以使用 `${role}.podTemplate.main.image` 字段（其中 `role` 可以是 `meta`、`frontend`、`datanode` 和 `flownode`），该字段会**覆盖顶层**变量 `image` 的配置，如下所示：

```yaml
image:
  # -- The image registry
  registry: greptime-registry.cn-hangzhou.cr.aliyuncs.com
  # -- The image repository
  repository: greptime/greptimedb
  # -- The image tag
  tag: "v0.13.2"
  # -- The image pull secrets
  pullSecrets: []

frontend:
  podTemplate:
    main:
      image: "greptime-registry.cn-hangzhou.cr.aliyuncs.com/greptime/greptimedb:latest"
```

此时 `frontend` 的镜像将会被设置为 `greptime-registry.cn-hangzhou.cr.aliyuncs.com/greptime/greptimedb:latest`，而其他组件的镜像将会使用顶层变量 `image` 的配置。

### 服务端口配置

你可以使用如下字段来配置服务端口，如下所示：

- `httpServicePort`：用于配置 HTTP 服务的端口，默认 4000；
- `grpcServicePort`：用于配置 SQL 服务的端口，默认 4001；
- `mysqlServicePort`：用于配置 MySQL 服务的端口，默认 4002；
- `postgresServicePort`：用于配置 PostgreSQL 服务的端口，默认 4003；

### Datanode 存储配置

你可以通过 `datanode.storage` 字段来配置 Datanode 的存储，如下所示：

```yaml
datanode:
  storage:
    # -- Storage class for datanode persistent volume
    storageClassName: null
    # -- Storage size for datanode persistent volume
    storageSize: 10Gi
    # -- Storage retain policy for datanode persistent volume
    storageRetainPolicy: Retain
    # -- The dataHome directory, default is "/data/greptimedb/"
    dataHome: "/data/greptimedb"
```

- `storageClassName`：用于配置 StorageClass，默认使用 Kubernetes 当前默认的 StorageClass；
- `storageSize`：用于配置 Storage 的大小，默认 10Gi。你可以使用常用的容量单位，如 `10Gi`、`10GB` 等；
- `storageRetainPolicy`：用于配置 Storage 的保留策略，默认 `Retain`，如果设置为 `Delete`，则当集群被删除时，相应的 Storage 也会被删除；
- `dataHome`：用于配置数据目录，默认 `/data/greptimedb/`；

### 运行资源配置

顶层变量 `base.podTemplate.main.resources` 用于全局配置每个 Role 的资源，如下所示：

```yaml
base:
  podTemplate:
    main:
      resources:
        requests:
          memory: "1Gi"
          cpu: "1"
        limits:
          memory: "2Gi"
          cpu: "2"
```

如果你想为集群中的每个 Role 配置不同的资源，可以使用 `${role}.podTemplate.main.resources` 字段（其中 `role` 可以是 `meta`、`frontend`、`datanode` 等），改字段会**覆盖顶层**变量 `base.podTemplate.main.resources` 的配置，如下所示：

```yaml
base:
  podTemplate:
    main:
      resources:
        requests:
          memory: "1Gi"
          cpu: "1"
        limits:
          memory: "2Gi"
          cpu: "2"

frontend:
  podTemplate:
    main:
      resources:
        requests:
          cpu: "2"
          memory: "4Gi"
        limits:
          cpu: "4"
          memory: "8Gi"
```

### 服务运行副本数配置

对于不同 Role 的副本数，可以通过 `${role}.replicas` 字段进行配置对应的副本数，如下所示：

```yaml
frontend:
  replicas: 3

datanode:
  replicas: 3
```

你可以通过配置其副本数来实现水平扩缩。

### 环境变量配置

你既可以通过 `base.podTemplate.main.env` 字段配置全局的环境变量，也可以通过 `${role}.podTemplate.main.env` 字段为每个 Role 配置不同的环境变量，如下所示：

```yaml
base:
  podTemplate:
    main:
      env:
        - name: GLOBAL_ENV
          value: "global_value"

frontend:
  podTemplate:
    main:
      env:
        - name: FRONTEND_ENV
          value: "frontend_value"
```

### 注入配置文件

对于不同 Role 的服务，你可以通过 `${role}.configData` 字段注入自定义的 TOML 配置文件，如下所示：

```yaml
datanode:
  configData: |
    [[region_engine]]
    [region_engine.mito]
    # Number of region workers
    num_workers = 8
```

你可以通过 [config.md](https://github.com/GreptimeTeam/greptimedb/blob/main/config/config.md) 了解 GreptimeDB 的配置项。

除了使用 `${role}.configData` 字段注入配置文件，你还可以通过 `${role}.configFile` 来指定相应的文件，如下所示：

```yaml
frontend:
  configFile: "configs/frontend.toml"
```

此时需要确保对应的配置文件路径与执行 `helm upgrade` 命令时所处的目录一致。

:::note
用户注入的配置文件默认优先级低于由 GreptimeDB Operator 所接管的配置项，某些配置项仅能通过 GreptimeDB Operator 进行配置，而这些配置项默认会暴露在 `values.yaml` 中。

如下默认配置将由 GreptimeDB Operator 管理：

- Logging 配置；
- Datanode 的 Node ID；
:::

### 鉴权配置

Helm Chart 默认不启用 User Provider 模式的鉴权，你可以通过 `auth.enabled` 字段启用 User Provider 模式的鉴权并配置相应的用户信息，如下所示：

```yaml
auth:
  enabled: true
  users:
    - username: "admin"
      password: "admin"
```

### 日志配置

顶层变量 `logging` 用于配置全局日志级别，如下所示：

```yaml
# -- Global logging configuration
logging:
  # -- The log level for greptimedb, only support "debug", "info", "warn", "debug"
  level: "info"

  # -- The log format for greptimedb, only support "json" and "text"
  format: "text"

  # -- The logs directory for greptimedb
  logsDir: "/data/greptimedb/logs"

  # -- Whether to log to stdout only
  onlyLogToStdout: false

  # -- indicates whether to persist the log with the datanode data storage. It **ONLY** works for the datanode component.
  persistentWithData: false

  # -- The log filters, use the syntax of `target[span\{field=value\}]=level` to filter the logs.
  filters: []

  # -- The slow query log configuration.
  slowQuery:
    # -- Enable slow query log.
    enabled: false

    # -- The threshold of slow query log in seconds.
    threshold: "10s"

    # -- Sample ratio of slow query log.
    sampleRatio: "1.0"
```

其中：

- `logging.level`：用于配置全局日志级别，支持 `debug`、`info`、`warn`、`error` 四个级别；
- `logging.format`：用于配置全局日志格式，支持 `json` 和 `text` 两种格式；
- `logging.logsDir`：用于配置全局日志目录，默认位于 `/data/greptimedb/logs`；
- `logging.onlyLogToStdout`：用于配置是否仅输出到标准输出，默认不启用；
- `logging.persistentWithData`：用于配置是否将日志持久化到数据存储，仅适用于 `datanode` 组件，默认不启用；
- `logging.filters`：用于配置全局日志过滤器，支持 `target[span\{field=value\}]=level` 的语法，特步地，如果你希望对某些组件启动 `debug` 级别的日志，可以配置如下：

   ```yaml
   logging:
     level: "info"
     format: "json"
     filters:
     - mito2=debug
   ```

你还可以通过 `logging.slowQuery` 字段配置来启用慢查询日志，如下所示：

```yaml
logging:
  slowQuery:
    enabled: true
    threshold: "100ms"
    sampleRatio: "1.0"
```

其中：

- `logging.slowQuery.enabled`：用于配置是否启用慢查询日志，默认不启用；
- `logging.slowQuery.threshold`：用于配置慢查询日志的阈值；
- `logging.slowQuery.sampleRatio`：用于配置慢查询日志的采样率，默认 1.0（即全部采样）；

如果配置了输出目录 `logging.logsDir`，则慢查询日志会输出到该目录下。

每一个 Role 的日志配置都可以通过 `${role}.logging` 字段进行配置，其字段与顶层 `logging` 一致，并会**覆盖**顶层变量 `logging` 的配置，比如：

```yaml
frontend:
  logging:
    level: "debug"
```

### 启用 Flownode

Helm Chart 默认不启用 Flownode，你可以通过 `flownode.enabled` 字段启用 Flownode，如下所示：

```yaml
flownode:
  enabled: true
```

`flownode` 的其他字段的配置与其他 Role 的配置一致，比如：

```yaml
flownode:
  enabled: true
  replicas: 1
  podTemplate:
    main:
      resources:
        requests:
          memory: "1Gi"
          cpu: "1"
        limits:
          memory: "2Gi"
          cpu: "2"
```

### 对象存储配置

`objectStorage` 字段用于配置云对象存储（例如 AWS S3 和 Azure Blob Storage 等）作为 GreptimeDB 存储层。

#### AWS S3

```yaml
objectStorage:
  credentials:
    # AWS access key ID
    accessKeyId: ""
    # AWS secret access key
    secretAccessKey: ""
  s3:
    # AWS S3 bucket name
    bucket: ""
    # AWS S3 region
    region: ""
    # The root path in bucket is 's3://<bucket>/<root>/data/...'
    root: ""
    # The AWS S3 endpoint, see more detail: https://docs.aws.amazon.com/general/latest/gr/s3.html
    endpoint: ""
```

#### Google Cloud Storage

```yaml
objectStorage:
  credentials:
    # GCP serviceAccountKey JSON-formatted base64 value 
    serviceAccountKey: ""
  gcs:
    # Google Cloud Storage bucket name
    bucket: ""
    # Google Cloud OAuth 2.0 Scopes, example: "https://www.googleapis.com/auth/devstorage.read_write"
    scope: ""
    # The root path in bucket is 'gcs://<bucket>/<root>/data/...'
    root: ""
    # Google Cloud Storage endpoint, example: "https://storage.googleapis.com"
    endpoint: ""
```

#### Azure Blob

```yaml
objectStorage:
  credentials:
    # Azure account name
    accountName: ""
    # Azure account key
    accountKey: ""
  azblob:
    # Azure Blob container name
    container: ""
    # The root path in container is 'blob://<bucket>/<root>/data/...'
    root: ""
    # Azure Blob endpoint, see: "https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-query-endpoint-srp?tabs=dotnet#query-for-the-blob-storage-endpoint"
    endpoint: ""
```

#### AliCloud OSS

```yaml
objectStorage:
  credentials:
    # AliCloud access key ID
    accessKeyId: ""
    # AliCloud access key secret
    accessKeySecret: ""
  oss:
    # AliCloud OSS bucket name
    bucket: ""
    # AliCloud OSS region
    region: ""
    # The root path in bucket is 'oss://<bucket>/<root>/data/...'
    root: ""
    # The AliCloud OSS endpoint
    endpoint: ""
```

### Prometheus 监控配置

如果你已经安装了 [prometheus-operator](https://github.com/prometheus-operator/prometheus-operator)，你可以通过 `prometheusMonitor.enabled` 字段创建 Prometheus PodMonitor 来监控 GreptimeDB，如下所示：

```yaml
prometheusMonitor:
  # -- Create PodMonitor resource for scraping metrics using PrometheusOperator
  enabled: false
  # -- Interval at which metrics should be scraped
  interval: "30s"
  # -- Add labels to the PodMonitor
  labels:
    release: prometheus
```

### Debug Pod 配置

debug pod 中安装了各种工具（例如 mysql-client、psql-client 等）。你可以 exec 进入调试 debug pod 进行调试。使用 `debugPod.enabled` 字段创建它，如下所示：

```yaml
debugPod:
  # -- Enable debug pod
  enabled: false

  # -- The debug pod image
  image:
    registry: docker.io
    repository: greptime/greptime-tool
    tag: "20250317-5281e66"

  # -- The debug pod resource
  resources:
    requests:
      memory: 64Mi
      cpu: 50m
    limits:
      memory: 256Mi
      cpu: 200m
```
