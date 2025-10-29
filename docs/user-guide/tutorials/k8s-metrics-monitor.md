---
keywords: [Kubernetes, Prometheus, monitoring, metrics, observability, GreptimeDB, Prometheus Operator, Grafana]
description: Guide to monitoring Kubernetes metrics using Prometheus with GreptimeDB as the storage backend, including architecture overview, installation, and visualization with Grafana.
---

# Monitor Kubernetes Metrics with Prometheus and GreptimeDB

This guide demonstrates how to set up a complete Kubernetes monitoring solution using Prometheus for metrics collection and GreptimeDB as the long-term storage backend.

## What is Kubernetes Monitoring

Kubernetes monitoring is the practice of collecting, analyzing, and acting on metrics and logs from a Kubernetes cluster.
It provides visibility into the health, performance, and resource utilization of your containerized applications and infrastructure.

Key aspects of Kubernetes monitoring include:

- **Resource Metrics**: CPU, memory, disk, and network usage for nodes, pods, and containers
- **Cluster Health**: Status of cluster components like kube-apiserver, etcd, and controller-manager
- **Application Metrics**: Custom metrics from your applications running in the cluster
- **Events and Logs**: Kubernetes events and container logs for troubleshooting

Effective monitoring helps you:
- Detect and diagnose issues before they impact users
- Optimize resource utilization and reduce costs
- Plan capacity based on historical trends
- Ensure SLA compliance
- Troubleshoot performance bottlenecks

## Architecture Overview

The monitoring architecture consists of the following components:

![Kubernetes Monitoring Architecture](/k8s-metrics-monitor-architecture.drawio.svg)

**Components:**

- **kube-state-metrics**: Exports cluster-level metrics about Kubernetes objects (deployments, pods, services, etc.)
- **Node Exporter**: Exports hardware and OS-level metrics from each Kubernetes node
- **Prometheus Operator**: Automates Prometheus deployment and configuration using Kubernetes custom resources
- **GreptimeDB**: Acts as the long-term storage backend for Prometheus metrics with high compression and query performance
- **Grafana**: Provides dashboards and visualizations for metrics stored in GreptimeDB

## Prerequisites

Before starting, ensure you have:

- A running Kubernetes cluster (version >= 1.18)
- `kubectl` configured to access your cluster
- [Helm](https://helm.sh/docs/intro/install/) v3.0.0 or higher installed
- Sufficient cluster resources (at least 2 CPU cores and 4GB memory available)

## Install GreptimeDB

GreptimeDB serves as the long-term storage backend for Prometheus metrics.
For detailed installation steps,
please refer to the [Deploy GreptimeDB Cluster](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md) documentation.

### Verify the GreptimeDB Installation

After deploying GreptimeDB, verify that the cluster is running.
In this guide we assume the GreptimeDB cluster is deployed in the `greptime-cluster` namespace and named `greptimedb`.

```bash
kubectl -n greptime-cluster get greptimedbclusters.greptime.io greptimedb
```

```bash
NAME         FRONTEND   DATANODE   META   FLOWNODE   PHASE     VERSION   AGE
greptimedb   1          1          1      1          Running   v0.17.2   33s
```

Check the pods:

```bash
kubectl get pods -n greptime-cluster
```

```bash
greptimedb-datanode-0                 1/1     Running   0          44s
greptimedb-flownode-0                 1/1     Running   0          28s
greptimedb-frontend-8bf9f558c-7wdmk   1/1     Running   0          34s
greptimedb-meta-fc4ddb78b-nv944       1/1     Running   0          50s
```

### The GreptimeDB Service Address

To configure Prometheus Remote Write, you need the GreptimeDB service address.
Since GreptimeDB runs inside the Kubernetes cluster, use the internal cluster address.

The GreptimeDB frontend service address follows this pattern:
```
<greptimedb-name>-frontend.<namespace>.svc.cluster.local:<port>
```

In this guide:
- GreptimeDB cluster name: `greptimedb`
- Namespace: `greptime-cluster`
- Frontend port: `4000`

So the service address is:
```bash
greptimedb-frontend.greptime-cluster.svc.cluster.local:4000
```

The full [Remote Write URL](/user-guide/ingest-data/for-observability/prometheus.md#remote-write-configuration) for Prometheus is:

```bash
http://greptimedb-frontend.greptime-cluster.svc.cluster.local:4000/v1/prometheus/write?db=public
```
### Performance Tuning

For optimal performance when using GreptimeDB as Prometheus storage,
refer to the [Improve efficiency by using metric engine](/user-guide/ingest-data/for-observability/prometheus.md#improve-efficiency-by-using-metric-engine) guide, which provides recommendations for improving write throughput and query efficiency.

## Install Prometheus Operator

Now that GreptimeDB is running, we'll install Prometheus to collect metrics and send them to GreptimeDB for long-term storage.

### Add the Prometheus Community Helm Repository

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

### Install the kube-prometheus-stack

The [`kube-prometheus-stack`](https://github.com/prometheus-operator/kube-prometheus) is a comprehensive monitoring solution that includes
Prometheus, Grafana, kube-state-metrics, and node-exporter components.
This stack automatically discovers and monitors all Kubernetes namespaces,
collecting metrics from cluster components, nodes, and workloads.
In this deployment, we'll configure Prometheus to use GreptimeDB as the remote write destination for long-term metric storage:

```bash
helm install kube-prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set "prometheus.prometheusSpec.remoteWrite[0].url=http://greptimedb-frontend.greptime-cluster.svc.cluster.local:4000/v1/prometheus/write?db=public" \
  --create-namespace
```

### Verify the Installation

Check that all Prometheus components are running:

```bash
kubectl get pods -n monitoring
```

```bash
NAME                                                     READY   STATUS    RESTARTS   AGE
alertmanager-kube-prometheus-kube-prome-alertmanager-0   2/2     Running        0          60s
kube-prometheus-grafana-78ccf96696-sghx4                 3/3     Running        0          78s
kube-prometheus-kube-prome-operator-775fdbfd75-w88n7     1/1     Running        0          78s
kube-prometheus-kube-state-metrics-5bd5747f46-d2sxs      1/1     Running        0          78s
kube-prometheus-prometheus-node-exporter-ts9nn           1/1     Running        0          78s
prometheus-kube-prometheus-kube-prome-prometheus-0       1/2     Running        0          60s
```

## Configure GreptimeDB as Prometheus Storage

The remote write URL was configured during the [Prometheus installation](#install-the-kube-prometheus-stack).

### Verify the Remote Write Configuration

Check the current Prometheus configuration:

```bash
kubectl get prometheus kube-prometheus-kube-prome-prometheus -n monitoring -o yaml | grep -A 5 remoteWrite
```

```yaml
remoteWrite:
  - url: http://greptimedb-frontend.greptime-cluster.svc.cluster.local:4000/v1/prometheus/write?db=public
  replicas: 1
  ... other configurations ...
```
### Configure Remote Read

The Remote Read configuration allows Prometheus to read back data from GreptimeDB.
Add the Remote Read configuration to the Prometheus custom resource:

```bash
kubectl patch prometheus kube-prometheus-kube-prome-prometheus -n monitoring --type merge -p '
spec:
  remoteRead:
  - url: http://greptimedb-frontend.greptime-cluster.svc.cluster.local:4000/v1/prometheus/read?db=public
'
```

### Verify the Configuration

Check that Prometheus is successfully writing metrics to GreptimeDB:

```bash
kubectl port-forward -n greptime-cluster svc/greptimedb-frontend 4000:4000
```

In another terminal, query GreptimeDB:

```bash
curl http://localhost:4000/v1/sql?sql=SHOW+TABLES
```

You should see tables created for various Prometheus metrics.

## Use Grafana for Visualization

Grafana is included in the kube-prometheus-stack and comes pre-configured with dashboards using Prometheus as a data source.

To access Grafana:

1. **Port-forward the Grafana service:**
  ```bash
  kubectl port-forward -n monitoring svc/kube-prometheus-grafana 3000:80
  ```

2. **Open Grafana in your browser:**
  Navigate to [http://localhost:3000](http://localhost:3000)

3. **Log in with default credentials:**
  - **Username:** `admin`
  - **Password:** Retrieve the auto-generated password:
    ```bash
    kubectl get secret --namespace monitoring kube-prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
    ```

4. **Explore the dashboards:**
  Navigate to `Dashboards` to view the pre-configured Kubernetes monitoring dashboards, including:
  - Kubernetes / Compute Resources / Cluster
  - Kubernetes / Compute Resources / Namespace (Pods)
  - Kubernetes / Compute Resources / Node (Pods)
  - Node Exporter / Nodes

## Conclusion

You now have a complete Kubernetes monitoring solution with Prometheus collecting metrics and GreptimeDB providing efficient long-term storage. This setup enables you to:

- Monitor cluster and application health in real-time
- Store metrics for historical analysis and capacity planning
- Create rich visualizations and dashboards with Grafana
- Query metrics using both PromQL and SQL

For more information about GreptimeDB and Prometheus integration, see:

- [Prometheus Integration](/user-guide/ingest-data/for-observability/prometheus.md)
- [Query Data in GreptimeDB](/user-guide/query-data/overview.md)

