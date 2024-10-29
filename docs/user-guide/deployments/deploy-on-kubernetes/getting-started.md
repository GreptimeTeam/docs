# Getting Started

In this guide, you will learn how to deploy a GreptimeDB cluster on Kubernetes using the GreptimeDB Operator.

:::warning
This guide is for demonstration purposes only. Do not use this setup in a production environment.
:::

:::note
The following output may have minor differences depending on the versions of the Helm charts and environment.
:::

## Prerequisites

- [Docker](https://docs.docker.com/get-started/get-docker/) >= v23.0.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0
- [kind](https://kind.sigs.k8s.io/docs/user/quick-start/) >= v0.20.0

## Create a test Kubernetes cluster

There are many ways to create a Kubernetes cluster for testing purposes. In this guide, we will use [kind](https://kind.sigs.k8s.io/docs/user/quick-start/) to create a local Kubernetes cluster.

Here is an example using `kind` v0.20.0:

```bash
kind create cluster
```

<details>
  <summary>Expected Output</summary>
```bash
Creating cluster "kind" ...
 ✓ Ensuring node image (kindest/node:v1.27.3) 🖼
 ✓ Preparing nodes 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
Set kubectl context to "kind-kind"
You can now use your cluster with:

kubectl cluster-info --context kind-kind

Thanks for using kind! 😊
```
</details>

Check the status of the cluster:

```bash
kubectl cluster-info
```

<details>
  <summary>Expected Output</summary>
```bash
Kubernetes control plane is running at https://127.0.0.1:60495
CoreDNS is running at https://127.0.0.1:60495/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```
</details>

## Add the Greptime Helm repository

We provide the official Helm [repository](https://github.com/GreptimeTeam/helm-charts) for the GreptimeDB Operator and GreptimeDB cluster. You can add the repository by running the following command:

```bash
helm repo add greptime https://greptimeteam.github.io/helm-charts/
helm repo update
```

Check the charts in the Greptime Helm repository:

```
helm search repo greptime
```

<details>
  <summary>Expected Output</summary>
```bash
NAME                          	CHART VERSION	APP VERSION  	DESCRIPTION
greptime/greptimedb-cluster   	0.2.25       	0.9.5        	A Helm chart for deploying GreptimeDB cluster i...
greptime/greptimedb-operator  	0.2.9        	0.1.3-alpha.1	The greptimedb-operator Helm chart for Kubernetes.
greptime/greptimedb-standalone	0.1.27       	0.9.5        	A Helm chart for deploying standalone greptimedb
```
</details>

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

The GreptimeDB cluster requires an etcd cluster for metadata storage. Let's install an etcd cluster using Bitnami's etcd Helm [chart](https://hub.docker.com/r/bitnami/etcd).

```bash
helm install \
  etcd oci://registry-1.docker.io/bitnamicharts/etcd \
  --version 10.2.12 \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  --create-namespace \
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

    kubectl run etcd-client --restart='Never' --image docker.io/bitnami/etcd:3.5.15-debian-12-r6 --env ETCDCTL_ENDPOINTS="etcd.etcd-cluster.svc.cluster.local:2379" --namespace etcd-cluster --command -- sleep infinity

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

## Install the GreptimeDB cluster with monitoring integration

Now that the GreptimeDB Operator and etcd cluster are installed, you can deploy a minimum GreptimeDB cluster with monitoring integration:

```bash
helm install mycluster \
  --set monitoring.enabled=true \
  --set grafana.enabled=true \
  greptime/greptimedb-cluster \
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

You can check the status of the GreptimeDB cluster:

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

You can check the Pods status of the GreptimeDB cluster:

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

As you can see, we create a minimum GreptimeDB cluster with 1 frontend, 1 datanode, and 1 metasrv. 

The cluster metrics and logs will be collected by the [vector](https://github.com/vectordotdev/vector) sidecar and sent to the standalone instance(`mycluster-monitor-standalone-0`) for monitoring.

The Grafana dashboard is also deployed to visualize the metrics from the standalone instance. 

## Explore the GreptimeDB cluster

### Access the GreptimeDB cluster

You can access the GreptimeDB cluster by port-forwarding the frontend service:

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

:::note
If you want to expose the service to the public, you can use the kubectl port-forward command with the `--address` option:

```bash
kubectl -n default port-forward --address 0.0.0.0 svc/mycluster-frontend 4000:4000 4001:4001 4002:4002 4003:4003
```
:::

Open the browser and navigate to `http://localhost:4000/dashboard` to access by the [GreptimeDB Dashboard](https://github.com/GrepTimeTeam/dashboard).

If you want to use other tools like `mysql` or `psql` to connect to the GreptimeDB cluster, you can refer to the [Quick Start](/getting-started/quick-start.md).

### Access the Grafana dashboard

You can access the Grafana dashboard by using `kubctl port-forward` the Grafana service:

```bash
kubectl -n default port-forward svc/mycluster-grafana 18080:80
```

Then, open your browser and navigate to `http://localhost:18080` to access the Grafana dashboard. The default username and password are `admin` and `gt-operator`:

![Grafana Dashboard](/kubernetes-cluster-grafana-dashboard.jpg)

There are three dashboards available:

- **GreptimeDB Cluster Metrics**: Displays the metrics of the GreptimeDB cluster.
- **GreptimeDB Cluster Logs**: Displays the logs of the GreptimeDB cluster.
- **GreptimeDB Cluster Slow Queries**: Displays the slow queries of the GreptimeDB cluster.

## Clean up

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
kubectl -n default delete pvc -l app.greptime.io/component=mycluster-monitor-standalone
```

### Clean up the etcd cluster

You can use the following command to clean up the etcd cluster:

```bash
kubectl -n etcd-cluster exec etcd-0 -- etcdctl del "" --from-key=true
```

### Destroy the Kubernetes cluster

If you are using `kind` to create the Kubernetes cluster, you can use the following command to destroy the cluster:

```bash
kind delete cluster
```
