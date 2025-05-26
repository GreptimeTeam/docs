---
keywords: [Kubernetes, deployment, getting started, prerequisites, installation]
description: Step-by-step guide to deploying a GreptimeDB standalone on Kubernetes.
---

# Getting Started

In this guide, you will learn how to deploy a GreptimeDB standalone on Kubernetes.

:::note
The following output may have minor differences depending on the versions of the Helm charts and environment.
:::

## Prerequisites

- [Docker](https://docs.docker.com/get-started/get-docker/) >= v23.0.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0
- [kind](https://kind.sigs.k8s.io/docs/user/quick-start/) >= v0.20.0

## Create a test Kubernetes cluster

:::warning
Using `kind` is not recommended for production environments or performance testing. For such use cases, we recommend using cloud-managed Kubernetes services such as [Amazon EKS](https://aws.amazon.com/eks/), [Google GKE](https://cloud.google.com/kubernetes-engine/), or [Azure AKS](https://azure.microsoft.com/en-us/services/kubernetes-service/), or deploying your own production-grade Kubernetes cluster.
:::

There are many ways to create a Kubernetes cluster for testing purposes. In this guide, we will use [kind](https://kind.sigs.k8s.io/docs/user/quick-start/) to create a local Kubernetes cluster. You can skip this step if you want to use the existing Kubernetes cluster.

Here is an example using `kind` v0.20.0:

```bash
kind create cluster
```

<details>
  <summary>Expected Output</summary>
```log
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
Not sure what to do next? 😅  Check out https://kind.sigs.k8s.io/docs/user/quick-start/
```
</details>

## Add the Greptime Helm repository

We provide the [official Helm repository](https://github.com/GreptimeTeam/helm-charts) for the GreptimeDB Operator and GreptimeDB cluster. You can add the repository by running the following command:

```
helm repo add greptime https://greptimeteam.github.io/helm-charts/
helm repo update
```

Check the charts in the Greptime Helm repository:

```bash
helm search repo greptime/greptimedb-standalone
```

<details>
  <summary>Expected Output</summary>
```bash
NAME                          	CHART VERSION	APP VERSION	DESCRIPTION
greptime/greptimedb-standalone	0.1.53       	0.14.3     	A Helm chart for deploying standalone greptimedb
```
</details>


## Install the GreptimeDB Standalone

### Basic Installation

For a quick start with default configuration:

```bash
helm upgrade --install greptimedb-standalone greptime/greptimedb-standalone -n default
```

<details>
  <summary>Expected Output</summary>
```bash
Release "greptimedb-standalone" does not exist. Installing it now.
NAME: greptimedb-standalone
LAST DEPLOYED: Mon May 26 08:06:54 2025
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
***********************************************************************
 Welcome to use greptimedb-standalone
 Chart version: 0.1.53
 GreptimeDB Standalone version: 0.14.3
***********************************************************************

Installed components:
* greptimedb-standalone

The greptimedb-standalone is starting, use `kubectl get statefulset greptimedb-standalone -n default` to check its status.
```
</details>

```bash
kubectl get pod -n default
```

<details>
  <summary>Expected Output</summary>
```bash
NAME                      READY   STATUS    RESTARTS   AGE
greptimedb-standalone-0   1/1     Running   0          40s
```
</details>

### Customized Installation

For production or customized deployments, create a `values.yaml` file:

```yaml
resources:
  requests:
    cpu: "2"
    memory: "4Gi"
  limits:
    cpu: "4"
    memory: "8Gi"
```

For more configuration options, please refer to the [documentation](https://github.com/GreptimeTeam/helm-charts/tree/main/charts/greptimedb-standalone).

Then install with custom values:

```bash
helm upgrade --install greptimedb-standalone greptime/greptimedb-standalone \
  --values values.yaml \
  --namespace default
```

<details>
  <summary>Expected Output</summary>
```bash
Release "greptimedb-standalone" has been upgraded. Happy Helming!
NAME: greptimedb-standalone
LAST DEPLOYED: Mon May 26 08:18:27 2025
NAMESPACE: default
STATUS: deployed
REVISION: 2
TEST SUITE: None
NOTES:
***********************************************************************
 Welcome to use greptimedb-standalone
 Chart version: 0.1.53
 GreptimeDB Standalone version: 0.14.3
***********************************************************************

Installed components:
* greptimedb-standalone

The greptimedb-standalone is starting, use `kubectl get statefulset greptimedb-standalone -n default` to check its status.
```
</details>

```bash
kubectl get pod -n default
```

<details>
  <summary>Expected Output</summary>
```bash
NAME                      READY   STATUS    RESTARTS   AGE
greptimedb-standalone-0   1/1     Running   0          3s
```
</details>

## Access GreptimeDB

After installation, you can access GreptimeDB through:

### MySQL Protocol

```bash
kubectl port-forward svc/greptimedb-standalone 4002:4002 -n default > connections.out &
```

```bash
mysql -h 127.0.0.1 -P 4002
```

<details>
  <summary>Expected Output</summary>
```bash
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.4.2 Greptime

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [(none)]>
```
</details>

### PostgreSQL Protocol

```bash
kubectl port-forward svc/greptimedb-standalone 4003:4003 -n default > connections.out &
```

```bash
psql -h 127.0.0.1 -p 4003 -d public
```

<details>
  <summary>Expected Output</summary>
```bash
psql (15.12, server 16.3-greptimedb-0.14.3)
WARNING: psql major version 15, server major version 16.
         Some psql features might not work.
Type "help" for help.

public=>
```
</details>

### HTTP API

```bash
kubectl port-forward svc/greptimedb-standalone 4000:4000 -n default > connections.out &
```

```bash
curl -X POST \
  -d 'sql=show tables' \
  http://localhost:4000/v1/sql
```

<details>
  <summary>Expected Output</summary>
```bash
{"output":[{"records":{"schema":{"column_schemas":[{"name":"Tables","data_type":"String"}]},"rows":[["numbers"]],"total_rows":1}}],"execution_time_ms":5}[root
```
</details>

## Uninstallation

To remove GreptimeDB standalone:

```bash
helm uninstall greptimedb-standalone -n default
```

```bash
kubectl delete pvc -l app.kubernetes.io/instance=greptimedb-standalone -n default
```
