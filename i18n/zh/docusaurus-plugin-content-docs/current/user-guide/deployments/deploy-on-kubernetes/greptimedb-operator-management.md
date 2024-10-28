# GreptimeDB Operator 的管理

## 前置依赖

- Kubernetes >= v1.18.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0

## 快速开始

:::warning
这种安装方式并不推荐在生产环境中使用。
:::

最快的安装 GreptimeDB Operator 的方式是使用 `bundle.yaml`：

```bash
kubectl apply -f \
  https://github.com/GreptimeTeam/greptimedb-operator/releases/latest/download/bundle.yaml \
  --server-side
```

`greptimedb-operator` 将会安装在 `greptimedb-admin` 命名空间中。当 `greptimedb-operator` 运行时，您可以使用以下命令来验证安装：

```bash
kubectl get pods -n greptimedb-admin
```

<details>
  <summary>期望输出</summary>
```bash
NAME                                   READY   STATUS    RESTARTS   AGE
greptimedb-operator-7947d785b5-b668p   1/1     Running   0          2m18s
```
</details>

## 生产环境部署

对于生产环境部署，推荐使用 Helm 来安装 GreptimeDB Operator。

### 安装

你可以参考 [安装 GreptimeDB Operator](/user-guide/deployments/deploy-on-kubernetes/getting-started.md#安装 GreptimeDB Operator) 获取详细的指导。

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

:::note
以下输出可能会因 Chart 版本而有所不同。
:::


<details>
<summary>预期输出</summary>
```bash
NAME                        	CHART VERSION	APP VERSION  	DESCRIPTION
greptime/greptimedb-operator	0.2.9        	0.1.3-alpha.1	The greptimedb-operator Helm chart for Kubernetes.
```
</details>

:::tip
如果你想列出所有可用的版本，你可以使用以下命令：

```
helm search repo greptime/greptimedb-operator --versions
```
:::

#### 升级 GreptimeDB Operator

你可以通过运行以下命令升级到最新发布的 GreptimeDB Operator 版本：

```bash
helm --namespace greptimedb-admin upgrade greptimedb-operator greptime/greptimedb-operator
```

:::note
以下输出可能会因 Chart 版本而有所不同。
:::

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

If you want to upgrade to a specific version, you can use the following command:

```bash
helm --namespace greptimedb-admin upgrade greptimedb-operator greptime/greptimedb-operator --version <version>
```

After the upgrade is complete, you can use the following command to verify the installation:

```bash
helm list -n greptimedb-admin
```

<details>
<summary>期望输出</summary>
```bash
NAME               	NAMESPACE	REVISION	UPDATED                             	STATUS  	CHART                    	APP VERSION
greptimedb-operator	default  	2       	2024-10-28 19:30:52.62097 +0800 CST 	deployed	greptimedb-operator-0.2.9	0.1.3-alpha.1
```
</details>

### CRDs

这里有两种类型的 CRD 与 GreptimeDB Operator 一起安装：`GreptimeDBCluster` 和 `GreptimeDBStandalone`。

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

默认情况下，GreptimeDB Operator chart 将管理 CRDs 的安装和升级，用户不需要手动管理它们。

### 配置

GreptimeDB Operator chart 提供了一组配置选项，允许您自行配置，您可以参考 [GreptimeDB Operator Helm Chart](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-operator/README.md) 来获取更多详细信息。

你可以创建一个 `values.yaml` 来配置 GreptimeDB Operator chart，例如：

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

replicas: 2

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi
```

你可以使用以下命令来安装带有自定义配置的 GreptimeDB Operator：

```bash
helm --namespace greptimedb-admin install greptimedb-operator greptime/greptimedb-operator -f values.yaml
```

如果你想使用自定义配置升级 GreptimeDB Operator，你可以使用以下命令：

```bash
helm --namespace greptimedb-admin upgrade greptimedb-operator greptime/greptimedb-operator -f values.yaml
```

:::tip

你可以使用以下一条同样的命令来安装或升级带有自定义配置的 GreptimeDB Operator：

```bash
helm --namespace greptimedb-admin upgrade --install \
  greptimedb-operator greptime/greptimedb-operator -f values.yaml
```
:::
