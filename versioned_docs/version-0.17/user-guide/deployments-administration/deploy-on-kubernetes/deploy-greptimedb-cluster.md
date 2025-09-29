---
keywords: [Kubernetes, deployment, getting started, GreptimeDB Operator, prerequisites, cluster creation, installation, verification]
description: Step-by-step guide to deploying a GreptimeDB cluster on Kubernetes using the GreptimeDB Operator, including prerequisites, cluster creation, installation, and verification.
---

# Deploy GreptimeDB Cluster

In this guide, you will learn how to deploy a GreptimeDB cluster on Kubernetes using the GreptimeDB Operator.

:::note
The following output may have minor differences depending on the versions of the Helm charts and environment.
:::

import PreKindHelm from './_pre_kind_helm.mdx';

<PreKindHelm />

## Install and verify the GreptimeDB Operator

It's ready to use Helm to install the GreptimeDB Operator on the Kubernetes cluster.

### Install the GreptimeDB Operator

The [GreptimeDB Operator](https://github.com/GrepTimeTeam/greptimedb-operator) is a Kubernetes operator that manages the lifecycle of GreptimeDB cluster.

Let's install the latest version of the GreptimeDB Operator in the `greptimedb-admin` namespace:

```bash
helm install greptimedb-operator greptime/greptimedb-operator -n greptimedb-admin --create-namespace
```

<details>
  <summary>Expected Output</summary>
```bash
NAME: greptimedb-operator
LAST DEPLOYED: Tue Oct 29 18:40:10 2024
NAMESPACE: greptimedb-admin
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
***********************************************************************
 Welcome to use greptimedb-operator
 Chart version: 0.2.9
 GreptimeDB Operator version: 0.1.3-alpha.1
***********************************************************************

Installed components:
* greptimedb-operator

The greptimedb-operator is starting, use `kubectl get deployments greptimedb-operator -n greptimedb-admin` to check its status.
```
</details>

:::note
There is another way to install the GreptimeDB Operator by using `kubectl` and `bundle.yaml` from the latest release:

```bash
kubectl apply -f \
  https://github.com/GreptimeTeam/greptimedb-operator/releases/latest/download/bundle.yaml \
  --server-side
```

This method is only suitable for quickly deploying GreptimeDB Operator in the test environments and is not recommended for production use.
:::

### Verify the GreptimeDB Operator installation

Check the status of the GreptimeDB Operator:

```bash
kubectl get pods -n greptimedb-admin -l app.kubernetes.io/instance=greptimedb-operator
```

<details>
  <summary>Expected Output</summary>
```bash
NAME                                   READY   STATUS    RESTARTS   AGE
greptimedb-operator-68d684c6cf-qr4q4   1/1     Running   0          4m8s
```
</details>

You also can check the CRD installation:

```bash
kubectl get crds | grep greptime
```

<details>
  <summary>Expected Output</summary>
```bash
greptimedbclusters.greptime.io      2024-10-28T08:46:27Z
greptimedbstandalones.greptime.io   2024-10-28T08:46:27Z
```
</details>

The GreptimeDB Operator will use `greptimedbclusters.greptime.io` and `greptimedbstandalones.greptime.io` CRDs to manage GreptimeDB cluster and standalone resources.

## Install the etcd cluster

The GreptimeDB cluster requires an etcd cluster for metadata storage. Let's install an etcd cluster using Bitnami's etcd Helm [chart](https://github.com/bitnami/charts/tree/main/bitnami/etcd).

```bash
helm install etcd \
  oci://registry-1.docker.io/bitnamicharts/etcd \
  --version VAR::etcdChartVersion \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  --create-namespace \
  --set global.security.allowInsecureImages=true \
  --set image.registry=docker.io \
  --set image.repository=greptime/etcd \
  --set image.tag=VAR::etcdImageVersion \
  -n etcd-cluster
```

<details>
  <summary>Expected Output</summary>
```bash
NAME: etcd
LAST DEPLOYED: Mon Oct 28 17:01:38 2024
NAMESPACE: etcd-cluster
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
CHART NAME: etcd
CHART VERSION: 10.2.12
APP VERSION: 3.5.15

** Please be patient while the chart is being deployed **

etcd can be accessed via port 2379 on the following DNS name from within your cluster:

    etcd.etcd-cluster.svc.cluster.local

To create a pod that you can use as a etcd client run the following command:

    kubectl run etcd-client --restart='Never' --image greptime/etcd:VAR::etcdImageVersion --env ETCDCTL_ENDPOINTS="etcd.etcd-cluster.svc.cluster.local:2379" --namespace etcd-cluster --command -- sleep infinity

Then, you can set/get a key using the commands below:

    kubectl exec --namespace etcd-cluster -it etcd-client -- bash
    etcdctl  put /message Hello
    etcdctl  get /message

To connect to your etcd server from outside the cluster execute the following commands:

    kubectl port-forward --namespace etcd-cluster svc/etcd 2379:2379 &
    echo "etcd URL: http://127.0.0.1:2379"

WARNING: There are "resources" sections in the chart not set. Using "resourcesPreset" is not recommended for production. For production installations, please set the following values according to your workload needs:
- disasterRecovery.cronjob.resources
- resources
  +info https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
```
</details>

Wait for the etcd cluster to be ready:

```bash
kubectl get pods -n etcd-cluster -l app.kubernetes.io/instance=etcd
```

<details>
  <summary>Expected Output</summary>
```bash
NAME     READY   STATUS    RESTARTS   AGE
etcd-0   1/1     Running   0          2m8s
etcd-1   1/1     Running   0          2m8s
etcd-2   1/1     Running   0          2m8s
```
</details>

You can test the etcd cluster by running the following command:

```bash
kubectl -n etcd-cluster \
  exec etcd-0 -- etcdctl endpoint health \
  --endpoints=http://etcd-0.etcd-headless.etcd-cluster.svc.cluster.local:2379,http://etcd-1.etcd-headless.etcd-cluster.svc.cluster.local:2379,http://etcd-2.etcd-headless.etcd-cluster.svc.cluster.local:2379
```

<details>
  <summary>Expected Output</summary>
```bash
http://etcd-1.etcd-headless.etcd-cluster.svc.cluster.local:2379 is healthy: successfully committed proposal: took = 3.008575ms
http://etcd-0.etcd-headless.etcd-cluster.svc.cluster.local:2379 is healthy: successfully committed proposal: took = 3.136576ms
http://etcd-2.etcd-headless.etcd-cluster.svc.cluster.local:2379 is healthy: successfully committed proposal: took = 3.147702ms
```
</details>

## Setup `values.yaml`

The `values.yaml` file contains parameters and configurations for GreptimeDB and is the key to defining the Helm chart.
For example, a minimal GreptimeDB cluster configuration is as follows:

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

The configuration above for the GreptimeDB cluster is not recommended for production use. 
You should adjust the configuration according to your requirements.
You can refer to the [configuration documentation](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md) for the complete `values.yaml` configuration options.


## Install the GreptimeDB cluster

Now that the GreptimeDB Operator and etcd cluster are installed,
and `values.yaml` is configured, 
you can deploy a minimal GreptimeDB cluster:

```bash
helm upgrade --install mycluster \
  greptime/greptimedb-cluster \
  --values /path/to/values.yaml \
  -n default
```

<details>
  <summary>Expected Output</summary>
```bash
Release "mycluster" does not exist. Installing it now.
NAME: mycluster
LAST DEPLOYED: Mon Oct 28 17:19:47 2024
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTES:
***********************************************************************
 Welcome to use greptimedb-cluster
 Chart version: 0.2.25
 GreptimeDB Cluster version: 0.9.5
***********************************************************************

Installed components:
* greptimedb-frontend
* greptimedb-datanode
* greptimedb-meta

The greptimedb-cluster is starting, use `kubectl get pods -n default` to check its status.
```
</details>

When starting the cluster installation, we can check the status of the GreptimeDB cluster with the following command. If you use a different cluster name and namespace, you can replace `mycluster` and `default` with your configuration:

```bash
kubectl -n default get greptimedbclusters.greptime.io mycluster
```

<details>
  <summary>Expected Output</summary>
```bash
NAME        FRONTEND   DATANODE   META   FLOWNODE   PHASE      VERSION   AGE
mycluster   1          1          1      0          Running    v0.9.5    5m12s
```
</details>

The above command will show the status of the GreptimeDB cluster. When the `PHASE` is `Running`, it means the GreptimeDB cluster has been successfully started.

You also can check the Pods status of the GreptimeDB cluster:

```bash
kubectl -n default get pods
```

<details>
  <summary>Expected Output</summary>
```bash
NAME                                 READY   STATUS    RESTARTS   AGE
mycluster-datanode-0                 2/2     Running   0          77s
mycluster-frontend-6ffdd549b-9s7gx   2/2     Running   0          66s
mycluster-meta-58bc88b597-ppzvj      2/2     Running   0          86s
```
</details>

As you can see, we have created a minimal GreptimeDB cluster consisting of 1 frontend, 1 datanode, and 1 metasrv by default. For information about the components of a complete GreptimeDB cluster, you can refer to [architecture](/user-guide/concepts/architecture.md).

## Explore the GreptimeDB cluster

:::warning
For production use, you should access the GreptimeDB cluster or Grafana inside the Kubernetes cluster or using the LoadBalancer type service.
:::

### Access the GreptimeDB cluster

You can access the GreptimeDB cluster by using `kubectl port-forward` the frontend service:

```bash
kubectl -n default port-forward svc/mycluster-frontend 4000:4000 4001:4001 4002:4002 4003:4003 
```

<details>
  <summary>Expected Output</summary>
```bash
Forwarding from 127.0.0.1:4000 -> 4000
Forwarding from [::1]:4000 -> 4000
Forwarding from 127.0.0.1:4001 -> 4001
Forwarding from [::1]:4001 -> 4001
Forwarding from 127.0.0.1:4002 -> 4002
Forwarding from [::1]:4002 -> 4002
Forwarding from 127.0.0.1:4003 -> 4003
Forwarding from [::1]:4003 -> 4003
```
</details>

Please note that when you use a different cluster name and namespace, you can use the following command, and replace `${cluster}` and `${namespace}` with your configuration:

```bash
kubectl -n ${namespace} port-forward svc/${cluster}-frontend 4000:4000 4001:4001 4002:4002 4003:4003 
```

:::warning
If you want to expose the service to the public, you can use the `kubectl port-forward` command with the `--address` option:

```bash
kubectl -n default port-forward --address 0.0.0.0 svc/mycluster-frontend 4000:4000 4001:4001 4002:4002 4003:4003
```

Please make sure you have the proper security settings in place before exposing the service to the public.
:::

Open the browser and navigate to `http://localhost:4000/dashboard` to access by the [GreptimeDB Dashboard](https://github.com/GrepTimeTeam/dashboard).

If you want to use other tools like `mysql` or `psql` to connect to the GreptimeDB cluster, you can refer to the [Quick Start](/getting-started/quick-start.md).

## Cleanup

:::danger
The cleanup operation will remove the metadata and data of the GreptimeDB cluster. Please make sure you have backed up the data before proceeding.
:::

### Stop the port-forwarding

Stop the port-forwarding for the GreptimeDB cluster:

```bash
pkill -f kubectl port-forward
```

### Uninstall the GreptimeDB cluster

To uninstall the GreptimeDB cluster, you can use the following command:

```bash
helm -n default uninstall mycluster
```

### Delete the PVCs

The PVCs wouldn't be deleted by default for safety reasons. If you want to delete the PV data, you can use the following command:

```bash
kubectl -n default delete pvc -l app.greptime.io/component=mycluster-datanode
```

### Cleanup the etcd cluster

You can use the following command to clean up the etcd cluster:

```bash
kubectl -n etcd-cluster exec etcd-0 -- etcdctl del "" --from-key=true
```

### Destroy the Kubernetes cluster

If you are using `kind` to create the Kubernetes cluster, you can use the following command to destroy the cluster:

```bash
kind delete cluster
```

## Next Steps

If you want to deploy a GreptimeDB cluster with Remote WAL, you can refer to [Configure Remote WAL](/user-guide/deployments-administration/deploy-on-kubernetes/configure-remote-wal.md) for more details.

