# GreptimeDB 分布式集群

GreptimeDB 可以运行于 [cluster](/contributor-guide/overview.md) 模式以支持水平扩展。

## 使用 Docker Compose

### 前置条件

使用 Docker Compose 是运行 GreptimeDB 集群的最简单方法。开始之前，请确保已经安装了 Docker。

### 步骤 1: 下载 Docker Compose 的 YAML 文件

```
wget https://raw.githubusercontent.com/GreptimeTeam/greptimedb/VAR::greptimedbVersion/docker/docker-compose/cluster-with-etcd.yaml
```

### 步骤 2: 启动集群

```
GREPTIMEDB_VERSION=VAR::greptimedbVersion \
GREPTIMEDB_REGISTRY=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
ETCD_REGISTRY=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  docker compose -f ./cluster-with-etcd.yaml up 
```

如果集群成功启动，它将监听 4000-4003 端口。你可以通过参考 [快速开始](../quick-start.md#连接到-greptimedb) 访问集群。

### 清理

你可以使用以下命令停止集群：

```
docker compose -f ./cluster-with-etcd.yaml down
```

默认情况下，数据将被存储在 `/tmp/greptimedb-cluster-docker-compose`。如果你想清理数据，也可删除该目录。

## 在 Kubernetes 中部署 GreptimeDB 集群

请参考 [在 Kubernetes 上部署](/user-guide/deployments/deploy-on-kubernetes/overview.md)。

## 下一步

学习如何使用 GreptimeDB：[快速开始](../quick-start.md#连接到-greptimedb)。
