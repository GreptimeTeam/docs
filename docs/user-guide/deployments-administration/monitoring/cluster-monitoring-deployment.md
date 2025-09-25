---
keywords: [Kubernetes deployment, cluster, monitoring]
description: Guide to deploying monitoring for GreptimeDB clusters on Kubernetes, including self-monitoring and Prometheus monitoring steps.
---

# Monitoring GreptimeDB Cluster

You have learned how to deploy a GreptimeDB cluster using GreptimeDB Operator in [Deploy GreptimeDB Cluster on Kubernetes](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md).
This document will introduce how to enable the monitoring configuration when deploying the GreptimeDB cluster.

## Quick Start Example

You can enable monitoring and Grafana by adding some configurations to the `values.yaml` file when deploying the GreptimeDB cluster using Helm Chart. 
A full example of `values.yaml` to deploy a minimal GreptimeDB cluster with monitoring and Grafana:

```yaml
image:
  registry: docker.io
  # Image repository:
  # Use `greptime/greptimedb` for OSS GreptimeDB,
  # consult staff for Enterprise GreptimeDB
  repository: <repository>
  # Image tag:
  # use database version for OSS GreptimeDB, for example, `VAR::greptimedbVersion`
  # consult staff for Enterprise GreptimeDB
  tag: <tag>
  pullSecrets: [ regcred ]

initializer:
  registry: docker.io
  repository: greptime/greptimedb-initializer

monitoring:
  # Enable monitoring
  enabled: true

grafana:
  # Enable grafana deployment.
  # It needs to enable monitoring `monitoring.enabled: true` first.
  enabled: true

frontend:
  replicas: 1

meta:
  replicas: 1
  backendStorage:
    etcd:
      endpoints: "etcd.etcd-cluster.svc.cluster.local:2379"

datanode:
  replicas: 1
```

After the monitoring configuration enabled, 
GreptimeDB Operator will launch an additional GreptimeDB Standalone instance to collect metrics and logs from the GreptimeDB cluster, including cluster logs.
To collect log data, GreptimeDB Operator will start a [Vector](https://vector.dev/) sidecar container in each Pod.

After the Grafana configuration enabled,
a Grafana instance which use the GreptimeDB Standalone instance configed in cluster monitoring as the data source.
By using both Prometheus and MySQL protocols to visualize the GreptimeDB cluster's monitoring data out of the box.

Then install the GreptimeDB cluster with the above `values.yaml` file:

```bash
helm upgrade --install mycluster \
  greptime/greptimedb-cluster \
  --values /path/to/values.yaml \
  -n default
```

After Installation, you can check the Pods status of the GreptimeDB cluster:

```bash
kubectl -n default get pods
```

<details>
  <summary>Expected Output</summary>
```bash
NAME                                 READY   STATUS    RESTARTS   AGE
mycluster-datanode-0                 2/2     Running   0          77s
mycluster-frontend-6ffdd549b-9s7gx   2/2     Running   0          66s
mycluster-grafana-675b64786-ktqps    1/1     Running   0          6m35s
mycluster-meta-58bc88b597-ppzvj      2/2     Running   0          86s
mycluster-monitor-standalone-0       1/1     Running   0          6m35s
```
</details>

Then you can access the Grafana dashboard by port-forwarding the Grafana service to your local machine:

```shell
kubectl -n default port-forward svc/mycluster-grafana 18080:80
```

Open your browser and navigate to `http://localhost:18080` to access the Grafana dashboard. The default username and password are `admin` and `gt-operator`. Navigate to the `Dashboards` section to explore the pre-configured dashboards for monitoring your GreptimeDB cluster.

![Grafana Dashboard](/kubernetes-cluster-grafana-dashboard.jpg)


## Monitoring Configurations

This section will introduce the details of the monitoring configurations.

### Enable Monitoring

Add the following configuration to [`values.yaml`](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md#setup-valuesyaml) will enable monitoring when deploying the GreptimeDB cluster:

```yaml
monitoring:
  enabled: true
```

This will deploy a GreptimeDB Standalone instance named `${cluster}-monitoring` to collect metrics and logs. You can check it with:

```
kubectl get greptimedbstandalones.greptime.io ${cluster}-monitoring -n ${namespace}
```

The GreptimeDB Standalone instance will expose services using `${cluster}-monitoring-standalone` as the Kubernetes Service name. You can use the following addresses to read monitoring data:

- **Prometheus metrics**: `http://${cluster}-monitor-standalone.${namespace}.svc.cluster.local:4000/v1/prometheus`
- **SQL logs**: `${cluster}-monitor-standalone.${namespace}.svc.cluster.local:4002`. By default, cluster logs are stored in `public._gt_logs` table.

### Customize Monitoring Storage

By default, this GreptimeDB Standalone instance will store monitoring data using the Kubernetes default StorageClass in local storage.
You can configure the GreptimeDB Standalone instance via the `monitoring.standalone` field in `values.yaml`, for example, the following configuration uses S3 object storage to store monitoring data:

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

### Customize Vector Sidecar

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

## Grafana Configurations

### Enable Grafana

Add the following configuration to `values.yaml` to enable the Grafana deployment:

```yaml
grafana:
  # Enable grafana deployment.
  # It needs to enable monitoring `monitoring.enabled: true` first.
  enabled: true
```

### Customize Grafana Data Sources

By default, Grafana will use `mycluster` and `default` as the cluster name and namespace to create data sources.
If you want to monitor clusters with different names or namespaces,
you'll need to create different data source configurations based on the cluster names and namespaces.
You can create a `values.yaml` file like this:

```yaml
monitoring:
  enabled: true

grafana:
  enabled: true
  datasources:
    datasources.yaml:
      datasources:
        - name: greptimedb-metrics
          type: prometheus
          url: http://${cluster}-monitor-standalone.${namespace}.svc.cluster.local:4000/v1/prometheus
          access: proxy
          isDefault: true

        - name: greptimedb-logs
          type: mysql
          url: ${cluster}-monitor-standalone.${namespace}.svc.cluster.local:4002
          access: proxy
          database: public
```

The above configuration will create the datasources for the GreptimeDB cluster metrics and logs in the Grafana dashboard:

- `greptimedb-metrics`: The metrics of the cluster are stored in the standalone monitoring database and exposed in Prometheus protocol (`type: prometheus`)
- `greptimedb-logs`: The logs of the cluster are stored in the standalone monitoring database and exposed in MySQL protocol (`type: mysql`). It uses the `public` database by default

### Access Grafana

```bash
kubectl -n ${namespace} port-forward svc/${cluster}-grafana 18080:80 
```

Then open your browser and navigate to `http://localhost:18080` to access the Grafana dashboard. The default username and password are `admin` and `gt-operator`:

![Grafana Dashboard](/kubernetes-cluster-grafana-dashboard.jpg)


## Cluster YAML Example

If you're not using Helm Chart, manually configure self-monitoring mode in the `GreptimeDBCluster` YAML:

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


