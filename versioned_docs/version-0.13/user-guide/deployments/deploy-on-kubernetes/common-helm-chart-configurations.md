---
keywords: [Kubernetes, Deployment, Helm Chart, Configuration]
description: Common Helm Chart Configurations
---

# Common Helm Chart Configurations

For each Helm Chart, you can create a `values.yaml` file for configuration. When you need to apply configurations, you can use the `helm upgrade` command:

```
helm upgrade --install ${release-name} ${chart-name} --namespace ${namespace} -f values.yaml
```

## GreptimeDB Cluster Chart

For complete configuration options, please refer to [GreptimeDB Cluster Chart](https://github.com/GreptimeTeam/helm-charts/tree/main/charts/greptimedb-cluster/README.md).

### GreptimeDB Image Configuration

The top-level variable `image` is used to configure the global GreptimeDB image for the cluster, as shown below:

```yaml
image:
  # -- The image registry
  registry: docker.io
  # -- The image repository
  repository: greptime/greptimedb
  # -- The image tag
  tag: "v0.13.2"
  # -- The image pull secrets
  pullSecrets: []
```

If you want to configure different images for each role in the cluster, you can use the `${role}.podTemplate.main.image` field (where `role` can be `meta`, `frontend`, `datanode` and `flownode`). This field will **override** the top-level `image` configuration, as shown below:

```yaml
image:
  # -- The image registry
  registry: docker.io
  # -- The image repository
  repository: greptime/greptimedb
  # -- The image tag
  tag: "v0.13.2"
  # -- The image pull secrets
  pullSecrets: []

frontend:
  podTemplate:
    main:
      image: "greptime/greptimedb:latest"
```

In this case, the `frontend` image will be set to `greptime/greptimedb:latest`, while other components will use the top-level `image` configuration.

### Service Ports Configuration

You can configure service ports using the following fields:

- `httpServicePort`: Configures the HTTP service port, default `4000`
- `grpcServicePort`: Configures the SQL service port, default `4001`
- `mysqlServicePort`: Configures the MySQL service port, default `4002`
- `postgresServicePort`: Configures the PostgreSQL service port, default `4003`

### Datanode Storage Configuration

You can configure Datanode storage through the `datanode.storage` field, as shown below:

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

- `storageClassName`: Configures the StorageClass, defaults to Kubernetes current default StorageClass
- `storageSize`: Configures the storage size, default `10Gi`. You can use common capacity units, such as `10Gi`, `10GB`, etc.
- `storageRetainPolicy`: Configures the storage retention policy, default `Retain`. If set to `Delete`, the storage will be deleted when the cluster is deleted
- `dataHome`: Configures the data directory, default `/data/greptimedb/`

### Resource Configuration

The top-level variable `base.podTemplate.main.resources` is used to globally configure resources for each role, as shown below:

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

If you want to configure different resources for each role in the cluster, you can use the `${role}.podTemplate.main.resources` field (where `role` can be `meta`, `frontend`, `datanode`, etc.). This field will **override** the top-level `base.podTemplate.main.resources` configuration, as shown below:

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

### Role Replicas Configuration

For different roles, the number of replicas can be configured through the `${role}.replicas` field, as shown below:

```yaml
frontend:
  replicas: 3

datanode:
  replicas: 3
```

You can achieve horizontal scaling by configuring the number of replicas.

### Environment Variable Configuration

You can configure global environment variables through the `base.podTemplate.main.env` field, and configure different environment variables for each Role through the `${role}.podTemplate.main.env` field, as shown below:

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

### Injecting Configuration Files

For different Role services, youcan inject custom TOML configuration files through the `${role}.configData` field, as shown below:

```yaml
datanode:
  configData: |
    [[region_engine]]
    [region_engine.mito]
    # Number of region workers
    num_workers = 8
```

You can learn about GreptimeDB configuration options through [config.md](https://github.com/GreptimeTeam/greptimedb/blob/main/config/config.md).

In addition to using the `${role}.configData` field to inject configuration files, you can also specify corresponding files through `${role}.configFile`, as shown below:

```yaml
frontend:
  configFile: "configs/frontend.toml"
```

In this case, ensure that the configuration file path matches the directory where the `helm upgrade` command is executed.

:::note
User-injected configuration files have lower priority by default than configuration items managed by GreptimeDB Operator. Some configuration items can only be configured through GreptimeDB Operator, and these items are exposed by default in `values.yaml`. 

The following default configurations are managed by GreptimeDB Operator:

- Logging configuration;
- Datanode's Node ID;
:::

### Authentication Configuration

The Helm Chart does not enable User Provider mode authentication by default. You can enable User Provider mode authentication and configure user information through the `auth.enabled` field, as shown below:

```yaml
auth:
  enabled: true
  users:
    - username: "admin"
      password: "admin"
```

### Logging Configuration

The top-level variable `logging` is used to configure global logging levels, as shown below:

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

Where:

- `logging.level`: Configures the global log level, supports `debug`, `info`, `warn`, `error`.
- `logging.format`: Configures the global log format, supports `json` and `text`.
- `logging.logsDir`: Configures the global log directory, default `/data/greptimedb/logs`.
- `logging.onlyLogToStdout`: Configures whether to output only to stdout, disabled by default.
- `logging.persistentWithData`: Configures whether to persist logs with data storage, only applies to the `datanode` component, disabled by default.
- `logging.filters`: Configures global log filters, supports the syntax `target[span\{field=value\}]=level`. For example, if you want to enable `debug` level logging for certain components:

   ```yaml
   logging:
     level: "info"
     format: "json"
     filters:
     - mito2=debug
   ```

You can also enable slow query logging through the `logging.slowQuery` field configuration, as shown below:

```yaml
logging:
  slowQuery:
    enabled: true
    threshold: "100ms"
    sampleRatio: "1.0"
```

Where:

- `logging.slowQuery.enabled`: Configures whether to enable slow query logging, disabled by default.
- `logging.slowQuery.threshold`: Configures the threshold for slow query logging.   
- `logging.slowQuery.sampleRatio`: Configures the sampling ratio for slow query logging, default `1.0` (full sampling).

If the output directory `logging.logsDir` is configured, slow query logs will be output to that directory.

Each role's logging configuration can be configured through the `${role}.logging` field, with fields consistent with the top-level `logging` and will **override** the top-level `logging` configuration, for example:

```yaml
frontend:
  logging:
    level: "debug"
```

### Enabling Flownode

The Helm Chart does not enable Flownode by default. You can enable Flownode through the `flownode.enabled` field, as shown below:

```yaml
flownode:
  enabled: true
```

Other fields of `flownode` are configured similarly to other Roles, for example:

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

### Object Storage Configuration

The `objectStorage` field is used to configure cloud object storage (such as AWS S3 and Azure Blob Storage, etc.) as the GreptimeDB storage layer.

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

### Prometheus Monitor Configuration

If you have [prometheus-operator](https://github.com/prometheus-operator/prometheus-operator) installed, you can create Prometheus PodMonitor to monitor GreptimeDB through the `prometheusMonitor.enabled` field as follows:

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

### Debug Pod Configuration

The debug pod has various tools installed (such as mysql-client, psql-client, etc.). You can exec into the debug pod for debugging. Create it with the `debugPod.enabled` field as follows:

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
