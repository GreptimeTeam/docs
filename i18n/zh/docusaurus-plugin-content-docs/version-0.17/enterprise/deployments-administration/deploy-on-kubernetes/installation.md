---
keywords: [Kubernetes 部署, GreptimeDB 企业版, 安装 GreptimeDB, 启动 GreptimeDB, 私有 docker 仓库, helm chart]
description: 在 Kubernetes 上安装 GreptimeDB 企业版的步骤，包括获取镜像、安装 GreptimeDB Operator 和 etcd 集群、配置 values.yaml 和启动 GreptimeDB。
---

# 部署 GreptimeDB 集群

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
  pullSecrets: []
```

其中 `<repository>` 是 `<registry>` 中 `：` 之后的部分；`<tag>` 是 GreptimeDB 企业版镜像的单独标识。

## 安装及启动

请参考[部署 GreptimeDB 集群](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md)文档。

