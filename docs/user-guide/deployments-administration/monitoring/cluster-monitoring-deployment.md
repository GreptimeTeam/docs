---
keywords: [Kubernetes deployment, cluster, monitoring]
description: Guide to deploying monitoring for GreptimeDB clusters on Kubernetes, including self-monitoring and Prometheus monitoring steps.
---

# Cluster Monitoring Deployment

After deploying a GreptimeDB cluster using GreptimeDB Operator, by default, its components (Metasrv / Datanode / Frontend) expose a `/metrics` endpoint on their HTTP port (default `4000`) for Prometheus metrics.

We provide two approaches to monitor the GreptimeDB cluster:

1. **Enable GreptimeDB Self-Monitoring**: The GreptimeDB Operator will launch an additional GreptimeDB Standalone instance and Vector Sidecar container to collect and store metrics and logs from the GreptimeDB cluster.
2. **Use Prometheus Operator to Configure Prometheus Metrics Monitoring**: Users need first to deploy Prometheus Operator and create Prometheus instance, then use Prometheus Operator's `PodMonitor` to write GreptimeDB cluster metrics into Prometheus.

Users can choose the appropriate monitoring approach based on their needs.

## Enable GreptimeDB Self-Monitoring

In self-monitoring mode, GreptimeDB Operator will launch an additional GreptimeDB Standalone instance to collect metrics and logs from the GreptimeDB cluster, including cluster logs. To collect log data, GreptimeDB Operator will start a [Vector](https://vector.dev/) sidecar container in each Pod. When this mode is enabled, JSON format logging will be automatically enabled for the cluster.

If you deploy the GreptimeDB cluster using Helm Chart (refer to [Getting Started](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md)), you can configure the `values.yaml` file as follows:

```yaml
monitoring:
  enabled: true
```

This will deploy a GreptimeDB Standalone instance named `${cluster}-monitoring` to collect metrics and logs. You can check it with:

```
kubectl get greptimedbstandalones.greptime.io ${cluster}-monitoring -n ${namespace}
```

By default, this GreptimeDB Standalone instance will store monitoring data using the Kubernetes default StorageClass in local storage. You can adjust this based on your needs.

The GreptimeDB Standalone instance can be configured via the `monitoring.standalone` field in `values.yaml`, for example:

```yaml
monitoring:
  enabled: true
  standalone:
    base:
     main:
       # Configure GreptimeDB Standalone instance image
       image: "greptime/greptimedb:latest"

       # Configure GreptimeDB Standalone instance resources
       resources:
         requests:
           cpu: "2"
           memory: "4Gi"
         limits:
           cpu: "2"
           memory: "4Gi"
    
    # Configure object storage for GreptimeDB Standalone instance
    objectStorage:
      s3:
        # Configure bucket
        bucket: "monitoring"
        # Configure region  
        region: "ap-southeast-1"
        # Configure secret name
        secretName: "s3-credentials"
        # Configure root path
        root: "standalone-with-s3-data"
```

The GreptimeDB Standalone instance will expose services using `${cluster}-monitoring-standalone` as the Kubernetes Service name. You can use the following addresses to read monitoring data:

- **Prometheus metrics**: `http://${cluster}-monitor-standalone.${namespace}.svc.cluster.local:4000/v1/prometheus`
- **SQL logs**: `${cluster}-monitor-standalone.${namespace}.svc.cluster.local:4002`. By default, cluster logs are stored in `public._gt_logs` table.

The Vector sidecar configuration for log collection can be customized via the `monitoring.vector` field:

```yaml
monitoring:
  enabled: true
  vector:
    # Configure Vector image registry
    registry: docker.io
    # Configure Vector image repository 
    repository: timberio/vector
    # Configure Vector image tag
    tag: nightly-alpine

    # Configure Vector resources
    resources:
      requests:
        cpu: "50m"
        memory: "64Mi"
      limits:
        cpu: "50m" 
        memory: "64Mi"
```

:::tip NOTE
The configuration structure has changed between chart versions:

- In older version: `meta.etcdEndpoints`
- In newer version: `meta.backendStorage.etcd.endpoints`

Always refer to the latest [values.yaml](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-cluster/values.yaml) in the Helm chart repository for the most up-to-date configuration structure.
:::

:::note
If you're not using Helm Chart, you can manually configure self-monitoring mode in the `GreptimeDBCluster` YAML:

```yaml
apiVersion: greptime.io/v1alpha1
kind: GreptimeDBCluster
metadata:
  name: basic
spec:
  base:
    main:
      image: greptime/greptimedb:latest
  frontend:
    replicas: 1
  meta:
    replicas: 1
    backendStorage:
      etcd:
        endpoints:
          - "etcd.etcd-cluster.svc.cluster.local:2379"
  datanode:
    replicas: 1
  monitoring:
    enabled: true
```

The `monitoring` field configures self-monitoring mode. See [`GreptimeDBCluster` API docs](https://github.com/GreptimeTeam/greptimedb-operator/blob/main/docs/api-references/docs.md#monitoringspec) for details.
:::

## Use Prometheus Operator to Configure Prometheus Metrics Monitoring

Users need to first deploy Prometheus Operator and create Prometheus instance. For example, you can use [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) to deploy the Prometheus stack. You can refer to its [official documentation](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) for more details.

After deploying Prometheus Operator and instances, you can configure Prometheus monitoring via the `prometheusMonitor` field in `values.yaml`:

```yaml
prometheusMonitor:
  # Enable Prometheus monitoring - this will create PodMonitor resources
  enabled: true
  # Configure scrape interval
  interval: "30s"
  # Configure labels
  labels:
    release: prometheus
```

:::note
The `labels` field must match the `matchLabels` field used to create the Prometheus instance, otherwise metrics collection won't work properly.
:::

After configuring `prometheusMonitor`, GreptimeDB Operator will automatically create `PodMonitor` resources and import metrics into Prometheus. You can check the `PodMonitor` resources with:

```
kubectl get podmonitors.monitoring.coreos.com -n ${namespace}
```

:::tip NOTE
The configuration structure has changed between chart versions:

- In older version: `meta.etcdEndpoints`
- In newer version: `meta.backendStorage.etcd.endpoints`

Always refer to the latest [values.yaml](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-cluster/values.yaml) in the Helm chart repository for the most up-to-date configuration structure.
:::

:::note
If not using Helm Chart, you can manually configure Prometheus monitoring in the `GreptimeDBCluster` YAML:

```yaml
apiVersion: greptime.io/v1alpha1
kind: GreptimeDBCluster
metadata:
  name: basic
spec:
  base:
    main:
      image: greptime/greptimedb:latest
  frontend:
    replicas: 1
  meta:
    replicas: 1
    backendStorage:
      etcd:
        endpoints:
          - "etcd.etcd-cluster.svc.cluster.local:2379"
  datanode:
    replicas: 1
  prometheusMonitor:
    enabled: true
    interval: "30s"
    labels:
      release: prometheus
```

The `prometheusMonitor` field configures Prometheus monitoring.
:::

## Import Grafana Dashboards

GreptimeDB cluster currently provides 3 Grafana dashboards:

- [Cluster Metrics Dashboard](https://github.com/GreptimeTeam/greptimedb/blob/main/grafana/greptimedb-cluster.json)
- [Cluster Logs Dashboard](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-cluster/dashboards/greptimedb-cluster-logs.json) 

:::note
The Cluster Logs Dashboard is only for self-monitoring mode, while the Cluster Metrics Dashboard works for both self-monitoring and Prometheus monitoring modes.
:::

If using Helm Chart, you can enable `grafana.enabled` to deploy Grafana and import dashboards automatically (see [Getting Started](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md)):

```yaml
grafana:
  enabled: true
```

If you already have Grafana deployed, follow these steps to import the dashboards:

1. **Add Data Sources**

   You can refer to Grafana's [datasources](https://grafana.com/docs/grafana/latest/datasources/) docs to add the following 3 data sources:

   - **`metrics` data source**
     
     For importing Prometheus metrics, works with both monitoring modes. For self-monitoring mode, use `http://${cluster}-monitor-standalone.${namespace}.svc.cluster.local:4000/v1/prometheus` as the URL. For your own Prometheus instance, use your Prometheus instance URL.

   - **`information-schema` data source**
    
     For importing cluster metadata via SQL, works with both monitoring modes. Use `${cluster}-frontend.${namespace}.svc.cluster.local:4002` as the SQL address with database `information_schema`.

   - **`logs` data source**
    
     For importing cluster logs via SQL, **only works with self-monitoring mode**. Use `${cluster}-monitor-standalone.${namespace}.svc.cluster.local:4002` as the SQL address with database `public`.

2. **Import Dashboards**
   
   You can refer to Grafana's [Import dashboards](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/import-dashboards/) docs.
