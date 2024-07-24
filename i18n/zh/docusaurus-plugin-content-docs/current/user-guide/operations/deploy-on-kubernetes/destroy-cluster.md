# 销毁集群

本指南将删除部署 Kubernetes 章节中根据文档所创建的所有资源。

## 卸载 GreptimeDB Operator

执行以下命令使用 Helm 卸载 GreptimeDB Operator：

```shell
helm uninstall greptimedb-operator -n greptimedb-admin
```

## 卸载 GreptimeDB 集群

对于使用 Helm 安装的 GreptimeDB 集群，请使用以下命令：

```shell
helm uninstall greptimedb -n greptimedb-cluster
```

如果使用 `kubectl` 安装了 GreptimeDB 集群，请使用以下命令进行删除：

```shell
kubectl delete greptimedbcluster greptimedb -n greptimedb-cluster
```

## 卸载 etcd

请运行以下命令使用 Helm 删除 etcd：

```shell
# 卸载 etcd。
helm uninstall etcd -n etcd
```

## 删除自定义资源定义 (CRDs)

```shell
kubectl delete crds greptimedbclusters.greptime.io
```

## 清理 namespace

最后，删除相关的命名空间：

```shell
kubectl delete namespace greptimedb-admin
kubectl delete namespace etcd
kubectl delete namespace greptimedb-cluster
```
