# 部署 GreptimeDB Operator

## 概述

GreptimeDB Kubernetes Operator 简化了在私有和公共云基础设施上部署 GreptimeDB 的过程。本指南将引导你在 Kubernetes 集群上安装最新的稳定版本的 GreptimeDB Operator。该 Operator 利用 [自定义资源定义 (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/#customresourcedefinitions) 将 GreptimeDB 表示为 Kubernetes [对象](https://kubernetes.io/docs/concepts/overview/working-with-objects/)。

## 先决条件
- [Helm](https://helm.sh/docs/intro/install/) (请使用与你的 Kubernetes API 版本相匹配的版本)

## 使用 Helm Charts 安装 GreptimeDB Operator

GreptimeDB 提供了一个 [兼容 Helm 的仓库](https://github.com/GreptimeTeam/helm-charts)，便于部署。按照以下步骤使用 Helm 安装 Operator：

### 添加 GreptimeDB Operator 仓库

确保你已经 [添加了 GreptimeDB Helm 仓库](/user-guide/deployments/deploy-on-kubernetes/overview.md#添加-helm-仓库)，
然后通过搜索 Operator chart 来验证 GreptimeDB Operator 仓库：

```bash
helm search repo greptimedb-operator
```

你应该看到类似如下的输出：
```
NAME                        	CHART VERSION	APP VERSION   	DESCRIPTION
greptime/greptimedb-operator	0.2.3        	0.1.0-alpha.29	The greptimedb-operator Helm chart for Kubernetes.
```

### 安装 Operator

要安装 Operator，运行以下 `helm install` 命令。此命令还会为安装创建一个专用的命名空间 `greptimedb-admin`。推荐为 Operator 创建专用的命名空间：

```bash
helm install \
  operator greptime/greptimedb-operator \
  --create-namespace \
  -n greptimedb-admin
```

### （可选）使用本地 Helm charts 进行安装

如您遇到网络问题，先拉取 chart 到本地：

```shell
wget https://downloads.greptime.cn/releases/charts/greptimedb-operator/latest/greptimedb-operator-latest.tgz
tar -zxvf greptimedb-operator-latest.tgz
```

然后安装 GreptimeDB Operator：

```shell
helm install greptimedb-operator greptimedb-operator \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --create-namespace \
  -n greptimedb-admin
```

### 验证 CRD 安装
检查 `greptimedb-admin` 命名空间的内容，确认所有自定义资源定义 (CRD) 是否已正确安装：

```bash
kubectl get crds -n greptimedb-admin
```

你应该看到类似如下的输出：
```bash
NAME                                CREATED AT
greptimedbclusters.greptime.io      2024-09-09T07:54:07Z
greptimedbstandalones.greptime.io   2024-09-09T07:54:07Z
```

### 验证 Operator 安装
安装后，检查 `greptimedb-admin` 命名空间的内容，确认所有 Pod 是否正常运行：
```bash
kubectl get pods -n greptimedb-admin
```

你应该看到类似如下的输出：
```bash
NAME                                            READY   STATUS    RESTARTS   AGE
operator-greptimedb-operator-7d58cb8f7c-jz46g   1/1     Running   0          26s
```