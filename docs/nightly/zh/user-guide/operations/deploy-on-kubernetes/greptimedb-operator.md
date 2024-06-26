# GreptimeDB Opertator

## 安装 GreptimeDB Opertator

通过利用 [Operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)，
[GreptimeDB Operator](https://github.com/GreptimeTeam/greptimedb-operator) 可以有效管理 [Kubernetes](https://kubernetes.io/) 上的 GreptimeDB 集群。
这个 operator 可以抽象出维护高可用 GreptimeDB 集群的模式。

你可以使用 Helm 来安装 GreptimeDB Operator。

为了避免遇到网络问题，先拉取 chart 到本地：

```shell
wget https://downloads.greptime.cn/releases/charts/greptimedb-operator/latest/greptimedb-operator-latest.tgz
tar -zxvf greptimedb-operator-latest.tgz
```

然后安装 GreptimeDB Operator：

```shell
helm upgrade \
  --install greptimedb-operator greptimedb-operator \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --create-namespace \
  -n greptimedb-admin
```

<!-- TODO: more feature instructions of GreptimeDB Operator -->

## Next steps

- [部署GreptimeDB集群](deploy-greptimedb-cluster.md)：本节介绍了如何在 Kubernetes 上部署 etcd 集群和 GreptimeDB 集群。
