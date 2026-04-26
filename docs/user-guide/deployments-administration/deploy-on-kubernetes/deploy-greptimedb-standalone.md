---
keywords: [Kubernetes, deployment, getting started, prerequisites, installation]
description: Step-by-step guide to deploying a GreptimeDB standalone on Kubernetes.
---

# Deploy GreptimeDB Standalone

In this guide, you will learn how to deploy a GreptimeDB standalone on Kubernetes.

:::note
The following output may have minor differences depending on the versions of the Helm charts and environment.
:::

import PreKindHelm from './_pre_kind_helm.mdx';

<PreKindHelm />

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
LAST DEPLOYED: Sun Apr 26 20:30:51 2026
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
***********************************************************************
 Welcome to use greptimedb-standalone
 Chart version: 0.4.2
 GreptimeDB Standalone version: 1.0.1
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
LAST DEPLOYED: Sun Apr 26 20:35:11 2026
NAMESPACE: default
STATUS: deployed
REVISION: 2
TEST SUITE: None
NOTES:
***********************************************************************
 Welcome to use greptimedb-standalone
 Chart version: 0.4.2
 GreptimeDB Standalone version: 1.0.1
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
psql (16.2, server 16.3-GreptimeDB-1.0.1)
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
  -d 'sql=show databases' \
  http://localhost:4000/v1/sql
```

<details>
  <summary>Expected Output</summary>
```bash
{"output":[{"records":{"schema":{"column_schemas":[{"name":"Database","data_type":"String"}]},"rows":[["greptime_private"],["information_schema"],["public"]],"total_rows":3}}],"execution_time_ms":167}
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
