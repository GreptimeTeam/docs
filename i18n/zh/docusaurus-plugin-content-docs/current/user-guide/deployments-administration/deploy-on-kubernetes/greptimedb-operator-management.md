---
keywords: [Operator 管理, 安装, 升级, 配置, 卸载, 自动化部署, 多云支持, 扩缩容, 监控]
description: GreptimeDB Operator 的管理指南，包括安装、升级、配置和卸载的详细步骤。
---

# GreptimeDB Operator 的管理

GreptimeDB Operator 使用 [Operator 模式](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) 在 [Kubernetes](https://kubernetes.io/) 上管理 [GreptimeDB](https://github.com/GrepTimeTeam/greptimedb) 资源。

就像自动驾驶一样，GreptimeDB Operator 自动化了 GreptimeDB 集群和单机实例的部署、配置和管理。

GreptimeDB Operator 包括但不限于以下功能：

- **自动化部署**: 通过提供 `GreptimeDBCluster` 和 `GreptimeDBStandalone` CRD 来自动化在 Kubernetes 上部署 GreptimeDB 集群和单机实例。

- **多云支持**: 用户可以在任何 Kubernetes 集群上部署 GreptimeDB，包括私有环境和公有云环境（如 AWS、GCP、阿里云等）。

- **扩缩容**: 通过修改 `GreptimeDBCluster` CR 中的 `replicas` 字段即可轻松实现 GreptimeDB 集群的扩缩容。

- **监控**: 通过在 `GreptimeDBCluster` CR 中提供 `monitoring` 字段来自动化部署基于 GreptimeDB 的监控组件。

本指南将展示如何在 Kubernetes 上安装、升级、配置和卸载 GreptimeDB Operator。

:::note
以下输出可能会因 Helm chart 版本和具体环境的不同而有细微差别。
:::

## 前置依赖

- Kubernetes >= v1.18.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0

## 生产环境部署

对于生产环境部署，推荐使用 Helm 来安装 GreptimeDB Operator。

### 安装

你可以参考 [安装和验证 GreptimeDB Operator](/user-guide/deployments-administration/deploy-on-kubernetes/getting-started.md#安装和验证-greptimedb-operator) 获取详细的指导。

:::note
如果你使用 [Argo CD](https://argo-cd.readthedocs.io/en/stable/) 来部署应用，请确保 `Application` 已设置 [`ServerSideApply=true`](https://argo-cd.readthedocs.io/en/latest/user-guide/sync-options/#server-side-apply) 以启用 server-side apply（其他 GitOps 工具可能也有类似的设置）。
:::

### 升级

我们总是将最新版本的 GreptimeDB Operator 作为 Helm chart 发布在我们的[官方 Helm 仓库](https://github.com/GreptimeTeam/helm-charts/tree/main)。

当最新版本的 GreptimeDB Operator 发布时，您可以通过运行以下命令来升级 GreptimeDB Operator。

#### 更新 Helm 仓库

```bash
helm repo update greptime
```

<details>
<summary>期望输出</summary>
```bash
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "greptime" chart repository
Update Complete. ⎈Happy Helming!⎈
```
</details>

你可以使用以下命令来搜索 GreptimeDB Operator 的最新版本：

```bash
helm search repo greptime/greptimedb-operator
```

<details>
<summary>预期输出</summary>
```bash
NAME                        	CHART VERSION	APP VERSION  	DESCRIPTION
greptime/greptimedb-operator	0.2.9        	0.1.3-alpha.1	The greptimedb-operator Helm chart for Kubernetes.
```
</details>

如果你想列出所有可用的版本，你可以使用以下命令：

```
helm search repo greptime/greptimedb-operator --versions
```

#### 升级 GreptimeDB Operator

你可以通过运行以下命令升级到最新发布的 GreptimeDB Operator 版本：

```bash
helm -n greptimedb-admin upgrade greptimedb-operator greptime/greptimedb-operator
```

<details>
<summary>期望输出</summary>
```bash
Release "greptimedb-operator" has been upgraded. Happy Helming!
NAME: greptimedb-operator
LAST DEPLOYED: Mon Oct 28 19:30:52 2024
NAMESPACE: greptimedb-admin
STATUS: deployed
REVISION: 2
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

如果你想升级到特定版本，你可以使用以下命令：

```bash
helm -n greptimedb-admin upgrade greptimedb-operator greptime/greptimedb-operator --version <version>
```

升级完成后，你可以使用以下命令来验证安装：

```bash
helm list -n greptimedb-admin
```

<details>
<summary>期望输出</summary>
```bash
NAME                    NAMESPACE               REVISION        UPDATED                                 STATUS          CHART                           APP VERSION  
greptimedb-operator     greptimedb-admin        1               2024-10-30 17:46:45.570975 +0800 CST    deployed        greptimedb-operator-0.2.9       0.1.3-alpha.1
```
</details>

### CRDs

这里将有两种类型的 CRD 与 GreptimeDB Operator 一起安装：`GreptimeDBCluster` 和 `GreptimeDBStandalone`。

你可以使用以下命令来验证安装：

```bash
kubectl get crd | grep greptime
```

<details>
  <summary>期望输出</summary>
```bash
greptimedbclusters.greptime.io      2024-10-28T08:46:27Z
greptimedbstandalones.greptime.io   2024-10-28T08:46:27Z
```
</details>

默认情况下，GreptimeDB Operator chart 将管理 CRDs 的安装和升级，用户不需要手动管理它们。如果你想了解这两类 CRD 的具体定义，可参考 GreptimeDB Operator 的 [API 文档](https://github.com/GreptimeTeam/greptimedb-operator/blob/main/docs/api-references/docs.md)。

### 配置

GreptimeDB Operator chart 提供了一组配置选项，允许您自行配置，您可以参考 [GreptimeDB Operator Helm Chart](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-operator/README.md) 来获取更多详细信息。

你可以创建一个 `values.yaml` 来配置 GreptimeDB Operator chart (完整的 `values.yaml` 配置可以参考 [chart](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-operator/values.yaml))，例如：

```yaml
image:
  # -- The image registry
  registry: docker.io
  # -- The image repository
  repository: greptime/greptimedb-operator
  # -- The image pull policy for the controller
  imagePullPolicy: IfNotPresent
  # -- The image tag
  tag: latest
  # -- The image pull secrets
  pullSecrets: []

replicas: 1

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi
```

:::note
中国大陆用户如有网络访问问题，可将上文中的 `image.registry` 配置为阿里云镜像仓库地址 `greptime-registry.cn-hangzhou.cr.aliyuncs.com`。
:::

你可以使用以下命令来安装带有自定义配置的 GreptimeDB Operator：

```bash
helm -n greptimedb-admin install greptimedb-operator greptime/greptimedb-operator -f values.yaml
```

如果你想使用自定义配置升级 GreptimeDB Operator，你可以使用以下命令：

```bash
helm -n greptimedb-admin upgrade greptimedb-operator greptime/greptimedb-operator -f values.yaml
```

你可以使用以下一条同样的命令来安装或升级带有自定义配置的 GreptimeDB Operator：

```bash
helm -n greptimedb-admin upgrade --install greptimedb-operator greptime/greptimedb-operator -f values.yaml
```

### 卸载

你可以使用 `helm` 命令来卸载 GreptimeDB Operator：

```bash
helm -n greptimedb-admin uninstall greptimedb-operator
```

默认情况下，卸载 GreptimeDB Operator 时不会删除 CRDs。

:::danger
如果你确实想要删除 CRDs，你可以使用以下命令：

```bash
kubectl delete crd greptimedbclusters.greptime.io greptimedbstandalones.greptime.io
```

删除 CRDs 后，相关资源将被删除。
:::
