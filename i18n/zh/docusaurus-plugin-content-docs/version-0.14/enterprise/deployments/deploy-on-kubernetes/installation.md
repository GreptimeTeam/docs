---
keywords: [Kubernetes 部署, GreptimeDB 企业版, 安装 GreptimeDB, 启动 GreptimeDB, 私有 docker 仓库, helm chart]
description: 在 Kubernetes 上安装 GreptimeDB 企业版的步骤，包括获取镜像、安装 GreptimeDB Operator 和 etcd 集群、配置 values.yaml 和启动 GreptimeDB。
---

# 安装

GreptimeDB 企业版以 docker 镜像发布。我们为每位国内的客户提供了一个单独的、托管在阿里云上的私有 docker 仓库，你可以使用 docker pull 命令直接拉取，或在 helm chart 中配置。

## 获取 GreptimeDB 企业版

Greptime 工作人员在首次交付给你 GreptimeDB 企业版时，会通过邮件或其他方式告知你 docker 仓库地址和用户名密码。请妥善保存，并切勿分享给外部人员！

GreptimeDB 企业版每次发布时，都有一个单独的 `tag` 标识。有了这个 `tag`，再加上工作人员告知你的仓库地址 `registry`、用户名 `username` 和密码 `password`，就可以拉取 GreptimeDB 企业版镜像了：

- 登上 docker 仓库：`docker login --username=<username> --password=<password> <registry>`
- 拉取 docker 镜像：`docker pull <registry>:<tag>`

接着在 helm chart 中配置 GreptimeDB 企业版：

首先在 k8s 中创建镜像仓库的 pull secret（详细方法和说明请参考 [k8s 的官方文档](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/)）。

```bash
kubectl create secret docker-registry regcred --docker-server=<registry> --docker-username=<username> --docker-password=<password>
```

例如：

![k8s_pull_secret](/k8s-pull-secret.jpg)

然后在 helm chart 的 `values.yaml` 中加入该 secret：

```yaml
image:
  registry: <registry>
  repository: <repository>
  tag: <tag>
  pullSecrets: [ regcred ]
```

其中 `<repository>` 是 `<registry>` 中 `：` 之后的部分；`<tag>` 是 GreptimeDB 企业版镜像的单独标识。

## 启动

我们建议你使用 helm chart 启动 GreptimeDB 企业版。

### 添加 Greptime Helm 仓库

:::tip NOTE
如你有网络访问问题，可跳过本步骤并直接参考下一步中使用阿里云 OCI 镜像仓库的方式。采用阿里云 OCI 镜像仓库的方式无需手动添加 Helm 仓库。
:::

我们提供了 GreptimeDB Operator 和 GreptimeDB 集群的[官方 Helm 仓库](https://github.com/GreptimeTeam/helm-charts)。你可以通过运行以下命令来添加仓库：

```bash
helm repo add greptime https://greptimeteam.github.io/helm-charts/
helm repo update
```

### 安装 GreptimeDB Operator

[GreptimeDB Operator](https://github.com/GrepTimeTeam/greptimedb-operator) 是一个用于管理 GreptimeDB 集群生命周期的 Kubernetes operator。
让我们在 greptimedb-admin 命名空间中安装最新版本的 GreptimeDB Operator：

```shell
helm install greptimedb-operator greptime/greptimedb-operator -n greptimedb-admin --create-namespace
```

:::tip NOTE
如你有网络访问问题，可直接使用阿里云 OCI 镜像仓库的方式安装 GreptimeDB Operator：
```bash
helm install greptimedb-operator \
  oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-operator \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  -n greptimedb-admin \
  --create-namespace
```
此时我们也将镜像仓库设置为了 Greptime 官方的阿里云镜像仓库。
:::

### 验证 GreptimeDB Operator 的安装

检查 GreptimeDB Operator 的状态：

```bash
kubectl get pods -n greptimedb-admin -l app.kubernetes.io/instance=greptimedb-operator
```

若有类似以下的预期输出，表示 GreptimeDB Operator 安装成功：

```bash
NAME                                   READY   STATUS    RESTARTS   AGE
greptimedb-operator-68d684c6cf-qr4q4   1/1     Running   0          4m8s
```

可参考 [GreptimeDB Operator 的管理文档](/user-guide/deployments/deploy-on-kubernetes/greptimedb-operator-management.md) 来了解 GreptimeDB Operator 的更多功能。

### 安装 etcd 集群

GreptimeDB 集群需要一个 etcd 集群来存储元数据。让我们使用 Bitnami 的 [etcd Helm chart](https://github.com/bitnami/charts/tree/main/bitnami/etcd) 来安装一个 etcd 集群：

```bash
helm install etcd \
  oci://registry-1.docker.io/bitnamicharts/etcd \
  --version 10.2.12 \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  --create-namespace \
  -n etcd-cluster
```

:::tip NOTE
如你有网络访问问题，可直接使用阿里云 OCI 镜像仓库的方式安装 etcd 集群：

```bash
helm install etcd \
  oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/etcd \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set image.tag=3.5.12 \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  --create-namespace \
  -n etcd-cluster
```

:::

### 配置 `values.yaml`

`values.yaml` 文件设置了 GreptimeDB 的一些参数和配置，是定义 helm chart 的关键。例如一个最小规模的 GreptimeDB 集群定义如下：

```yaml
image:
  registry: greptime-registry.cn-hangzhou.cr.aliyuncs.com
  repository: <repository>
  tag: <tag>
  pullSecrets: [ regcred ]

initializer:
  registry: greptime-registry.cn-hangzhou.cr.aliyuncs.com
  repository: greptime/greptimedb-initializer

frontend:
  replicas: 1

meta:
  replicas: 1
  backendStorage:
    etcd:
      endpoints: "etcd.etcd-cluster.svc.cluster.local:2379"

datanode:
  replicas: 1
```

可参考[配置文档](/user-guide/deployments/deploy-on-kubernetes/common-helm-chart-configurations.md)获取完整的 `values.yaml` 的配置项。

### 启动 GreptimeDB

在上述步骤都完成后，就可以用 helm 拉起 GreptimeDB 了：

```bash
helm upgrade --install my-greptimedb greptime/greptimedb-cluster --values /path/to/values.yaml
```


