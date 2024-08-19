# GreptimeDB Operator

## 安装 GreptimeDB Operator

通过利用 [Operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)，
[GreptimeDB Operator](https://github.com/GreptimeTeam/greptimedb-operator) 可以有效管理 [Kubernetes](https://kubernetes.io/) 上的 GreptimeDB 集群。
这个 operator 可以抽象出维护高可用 GreptimeDB 集群的模式。

你可以使用 Helm 来安装 GreptimeDB Operator。

```shell
helm upgrade \
  --install oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-operator greptimedb-operator \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --create-namespace \
  -n greptimedb-admin
```

## CRD 的安装和升级

Helm 被[设计](https://helm.sh/docs/chart_best_practices/custom_resource_definitions/#some-caveats-and-explanations)为无法自动更新 `<chart>/crds`，为了方便部署，GreptimeDB 支持使用 Chart 自动安装和升级 CRD。你可以在安装 Chart 时使用 `--set crds.install=false` 来禁用这个行为：

```shell
helm upgrade \
  --install oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-operator greptimedb-operator \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set crds.install=false \
  --create-namespace \
  -n greptimedb-admin \
  --set crds.install=false
```

当你卸载 GreptimeDB Operator 时，默认不会删除 CRD。

<!-- TODO: more feature instructions of GreptimeDB Operator -->

## Next steps

- [部署GreptimeDB集群](deploy-greptimedb-cluster.md)：本节介绍了如何在 Kubernetes 上部署 etcd 集群和 GreptimeDB 集群。
