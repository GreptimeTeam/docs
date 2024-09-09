# 升级 GreptimeDB Operator
你可以随时升级 GreptimeDB Operator，而不会影响已管理的 GreptimeDB 实例。本指南详细介绍了如何使用 Helm 将现有的 GreptimeDB Operator 从版本 0.2.1 升级到最新版本。

### 验证现有的 Operator 安装

首先，使用以下命令验证所有 Operator Pod 的健康状态和状态：

```bash
kubectl get pods -n greptimedb-admin
```

如果 Operator 安装在自定义命名空间中，请使用 `-n <NAMESPACE>` 将 `greptimedb-admin` 替换为你的特定命名空间。

接下来，查看命名空间中的已安装 Helm charts：

```bash
helm list -n greptimedb-admin
```

你应该看到类似如下的输出：
```
NAME               	NAMESPACE          	REVISION	UPDATED                                	STATUS  	CHART                    	APP VERSION
operator	        greptimedb-admin    1       	2024-08-30 08:04:53.388756424 +0000 UTC	deployed	greptimedb-operator-0.2.1	0.1.0-alpha.28
```

Operator chart 版本为 `greptimedb-operator-0.2.1` 的，APP 版本为 `0.1.0-alpha.28`。

### 更新 Operator 仓库

更新 GreptimeDB Operator 的 Helm 仓库以获取最新的 charts：

```bash
helm repo update greptimedb-operator
```

如果在添加仓库时使用了不同的别名，请将 `greptimedb-operator` 替换为相应的别名。你可以通过以下命令查看你的 Helm 仓库：

```bash
helm repo list
```

检查最新的可用 chart 版本：

```bash
helm search repo greptimedb-operator
```

你应该看到类似如下的输出：
```bash
NAME                        	CHART VERSION	APP VERSION   	DESCRIPTION
greptime/greptimedb-operator	0.2.3        	0.1.0-alpha.29	The greptimedb-operator Helm chart for Kubernetes.
```

### 升级 Operator 版本

使用 Helm 将 GreptimeDB Operator 升级到最新版本：
```bash
helm upgrade -n greptimedb-admin \
  operator greptime/greptimedb-operator
```

如果 Operator 安装在不同的命名空间中，请使用 `-n` 参数指定它。另外，如果使用了不同的安装名称，请在命令中将 `operator` 替换为实际的安装名称。

该命令应该会返回一个成功的升级结果，并显示递增的 REVISION 值。

### （可选）使用本地 Helm charts 进行升级
如您遇到网络问题，先拉取 chart 到本地：

```shell
wget https://downloads.greptime.cn/releases/charts/greptimedb-operator/latest/greptimedb-operator-latest.tgz
tar -zxvf greptimedb-operator-latest.tgz
```

然后安装 GreptimeDB Operator：

```shell
helm upgrade greptimedb-operator greptimedb-operator \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --create-namespace \
  -n greptimedb-admin
```

### 验证 Operator 升级

要确认升级成功，运行以下命令：
```bash
kubectl get pod -l 'app.kubernetes.io/name=operator' -n greptimedb-admin -o json | jq '.items[0].spec.containers[0].image'
```

你应该看到如下输出，表明 Operator 已成功升级到最新版本：
```bash
"docker.io/greptime/greptimedb-operator:v0.1.0-alpha.29"
```