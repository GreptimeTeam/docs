---
keywords: [Kubernetes 部署, GreptimeDB 单机版, 安装]
description: 在 Kubernetes 上部署 GreptimeDB 单机版的指南。
---

# 部署 GreptimeDB 单机版

在该指南中，你将学会如何在 Kubernetes 上部署 GreptimeDB 单机版。

:::note
以下输出可能会因 Helm chart 版本和具体环境的不同而有细微差别。
:::

import PreKindHelm from './_pre_kind_helm.mdx';

<PreKindHelm />

## 安装 GreptimeDB 单机版

### 基础安装

使用默认配置快速安装:

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

### 自定义安装

创建自定义配置文件 `values.yaml`:

```yaml
resources:
  requests:
    cpu: "2"
    memory: "4Gi"
  limits:
    cpu: "4"
    memory: "8Gi"
```

更多配置选项请参考 [文档](https://github.com/GreptimeTeam/helm-charts/tree/main/charts/greptimedb-standalone).

使用自定义配置安装:

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

## 访问 GreptimeDB

安装完成后，您可以通过以下方式访问 GreptimeDB:

### MySQL 协议

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

### PostgreSQL 协议

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

### HTTP 协议

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

## 卸载

删除 GreptimeDB 单机版:

```bash
helm uninstall greptimedb-standalone -n default
```

```bash
kubectl delete pvc -l app.kubernetes.io/instance=greptimedb-standalone -n default
```
