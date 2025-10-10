---
keywords: [Kubernetes deployment, enterprise cluster, monitoring, GreptimeDB Enterprise Management Console]
description: Complete guide to deploying self-monitoring for GreptimeDB enterprise clusters on Kubernetes, including GreptimeDB Enterprise Management Console setup and configuration options
---

# Self-Monitoring GreptimeDB Clusters

Before reading this document, ensure you understand how to [deploy a GreptimeDB enterprise cluster on Kubernetes](/enterprise/deployments-administration/deploy-on-kubernetes/installation.md).
This guide will walk you through configuring monitoring when deploying a GreptimeDB cluster.

## Quick Start
You can enable monitoring and the [GreptimeDB Enterprise Management Console](/enterprise/console-ui.md) by adding configurations to the `values.yaml` file when deploying the GreptimeDB cluster using Helm Chart. 
Here's a complete example of a `values.yaml` file for deploying a minimal GreptimeDB cluster with monitoring and the GreptimeDB Enterprise Management Console:

```yaml
image:
  registry: docker.io
  # Consult staff for GreptimeDB Enterprise
  repository: <repository>
  # Consult staff for GreptimeDB Enterprise
  tag: <tag>
  pullSecrets: [ regcred ]

initializer:
  registry: docker.io
  repository: greptime/greptimedb-initializer

monitoring:
  # Enable monitoring
  enabled: true

greptimedb-enterprise-dashboard:
  # Enable greptimedb-enterprise-dashboard deployment.
  # Requires monitoring to be enabled first (monitoring.enabled: true)
  enabled: true
  image:
    # Consult staff for repository and tag
    repository: <repository>
    tag: <tag>

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

When `monitoring` is enabled, GreptimeDB Operator launches an additional GreptimeDB Standalone instance to collect metrics and logs from the GreptimeDB cluster.
To collect log data, GreptimeDB Operator starts a [Vector](https://vector.dev/) sidecar container in each Pod.

When `greptimedb-enterprise-dashboard` is enabled, an enterprise dashboard is deployed that uses the GreptimeDB Standalone instance configured for cluster monitoring as its data source and provides management features for the GreptimeDB cluster.

Then install the GreptimeDB cluster with the above `values.yaml` file:

```bash
helm upgrade --install mycluster \
  greptime/greptimedb-cluster \
  --values /path/to/values.yaml \
  -n default
```

Then refer to the [Access GreptimeDB Management Console](#access-greptimedb-management-console) section below for details on accessing it.

## Monitoring Configuration

For detailed monitoring configuration options, please refer to the [monitoring configuration](/user-guide/deployments-administration/monitoring/cluster-monitoring-deployment.md#monitoring-configuration) documentation of the open source GreptimeDB.

## GreptimeDB Management Console Configuration

### Enable GreptimeDB Management Console

To enable GreptimeDB Management Console deployment, add the following configuration to `values.yaml`.
Note that monitoring must be enabled first (`monitoring.enabled: true`):

```yaml
monitoring:
  enabled: true

greptimedb-enterprise-dashboard:
  enabled: true
```

### Access GreptimeDB Management Console

You can access the GreptimeDB Management Console by port-forwarding the service to your local machine:

```bash
kubectl -n ${namespace} port-forward svc/${cluster-name}-greptimedb-enterprise-console 18080:19095
```

Then open `http://localhost:18080` to access the GreptimeDB Enterprise Management Console.

For detailed information on using the Management Console features and interface, please refer to the [Management Console](/enterprise/console-ui.md) documentation.


## Cleanup the PVCs

Please refer to the [Cleanup the PVCs](/user-guide/deployments-administration/monitoring/cluster-monitoring-deployment.md#cleanup-the-pvcs) section of the open source GreptimeDB documentation.

