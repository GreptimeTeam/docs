---
keywords: [Kubernetes 部署, GreptimeDB 企业版, 安装 GreptimeDB, 启动 GreptimeDB, 私有 docker 仓库, helm chart]
description: 在 Kubernetes 上安装 GreptimeDB 企业版的步骤，包括获取镜像、安装 GreptimeDB Operator 和 etcd 集群、配置 values.yaml 和启动 GreptimeDB。
---

# 部署 GreptimeDB 集群

GreptimeDB 企业版以 docker 镜像发布。我们为每位国内的客户提供了一个单独的、托管在阿里云上的私有 docker 仓库，你可以使用 docker pull 命令直接拉取，或在 helm chart 中配置。

## 获取 GreptimeDB 企业版镜像

你需要在 helm chart 的 `values.yaml` 文件中配置镜像信息以获得专属的 GreptimeDB 企业版，例如：

```yaml
customImageRegistry:
  enabled: true
  # -- pull secret 名称，可自定义，需要和 `image.pullSecrets` 保持一致
  secretName: greptimedb-custom-image-pull-secret
  registry: <registry>
  username: <username>
  password: <password>

image:
  registry: <registry>
  repository: <repository>
  tag: <tag>
  pullSecrets:
    - greptimedb-custom-image-pull-secret
```

上述配置中，
`customImageRegistry` 中的 `registry`、`username` 和 `password` 用于创建 k8s 的 pull secret，
`image` 中的 `registry`、`repository` 和 `tag` 用于指定 GreptimeDB 企业版镜像，
因此 `customImageRegistry.secretName` 和 `image.pullSecrets` 需要保持一致以保证拉取镜像时能够找到正确的认证信息。

请联系 Greptime 工作人员获取上述配置项的具体值。
Greptime 工作人员在首次交付给你 GreptimeDB 企业版时，会通过邮件或其他方式告知你 docker 仓库地址和用户名密码。请妥善保存，并切勿分享给外部人员！

## 安装及启动

请参考[部署 GreptimeDB 集群](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md)文档。

