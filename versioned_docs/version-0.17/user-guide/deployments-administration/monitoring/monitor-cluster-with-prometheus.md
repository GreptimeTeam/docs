---
keywords: [cluster, monitoring, Prometheus]
description: Learn how to monitor a GreptimeDB cluster using an existing Prometheus instance in Kubernetes, including configuration steps and Grafana dashboard setup.
---

# Prometheus-Monitoring GreptimeDB Cluster

Before reading this document, ensure you understand how to [deploy a GreptimeDB cluster on Kubernetes](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md).

It is recommended to use [self-monitoring mode](cluster-monitoring-deployment.md) to monitor GreptimeDB cluster,
as it's simple to set up and provides out-of-the-box Grafana dashboards.
However, if you already have a Prometheus instance deployed in your Kubernetes cluster and want to integrate
GreptimeDB cluster metrics into it, follow the steps below.


## Check the Prometheus Instance Configuration

Ensure you have deployed the Prometheus Operator and created a Prometheus instance. For example, you can use [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) to deploy the Prometheus stack. Refer to its [official documentation](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) for more details.

When deploying the Prometheus instance, ensure you set the labels used for scraping GreptimeDB cluster metrics.
For example, your existing Prometheus instance may contain the following configuration:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: greptime-podmonitor
  namespace: default
spec:
  selector:
    matchLabels:
      release: prometheus
  # other configurations...
```

When the `PodMonitor` is deployed,
the Prometheus Operator continuously watches for pods in the `default` namespace that match all labels defined in `spec.selector.matchLabels` (in this example, `release: prometheus`).

## Enable `prometheusMonitor` for GreptimeDB Cluster

When deploying a GreptimeDB cluster using a Helm Chart,
enable the `prometheusMonitor` field in your `values.yaml` file. For example:

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

**Important:** The `labels` field value (`release: prometheus`) 
must match the `matchLabels` field used to create the Prometheus instance,
otherwise metrics collection won't work properly.

After configuring `prometheusMonitor`,
the GreptimeDB Operator will automatically create `PodMonitor` resources and import metrics into Prometheus at the specified `interval`.
You can check the `PodMonitor` resources with:

```
kubectl get podmonitors.monitoring.coreos.com -n ${namespace}
```


:::note
If you're not using a Helm Chart, you can manually configure Prometheus monitoring in the `GreptimeDBCluster` YAML:

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

:::

## Grafana Dashboards

You need to deploy Grafana by yourself,
then import the dashboards.

### Add Data Sources

After deploying Grafana, 
refer to Grafana's [data sources](https://grafana.com/docs/grafana/latest/datasources/) documentation to add the following two type data sources:

- **Prometheus**: Name it `metrics`. This data source connects to your Prometheus instance, which collects GreptimeDB cluster monitoring metrics. Use your Prometheus instance URL as the connection URL.
- **MySQL**: Name it `information-schema`. This data source connects to your GreptimeDB cluster to access cluster metadata via the SQL protocol. If you have deployed GreptimeDB following the [Deploy a GreptimeDB Cluster on Kubernetes](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md) guide, use `${cluster-name}-frontend.${namespace}.svc.cluster.local:4002` as the server address with database `information_schema`.

### Import Dashboards

The [GreptimeDB Cluster Metrics Dashboard](https://github.com/GreptimeTeam/greptimedb/tree/VAR::greptimedbVersion/grafana/dashboards/metrics/cluster) uses the `metrics` and `information-schema` data sources to display GreptimeDB cluster metrics.

Refer to Grafana's [Import dashboards](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/import-dashboards/) documentation to learn how to import dashboards.
