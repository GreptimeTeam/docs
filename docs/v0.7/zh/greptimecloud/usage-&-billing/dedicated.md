# Dedicated

Dedicated 方案提供无限制的数据存储及数据过期配置，完全隔离的资源控制和网络，以及 Greptime 的 SRE 团队的支持。

如果你需要绝对隔离其他用户，或者需要超出 Serverless 方案的最大 WCU 和 RCU 限制，那么 Dedicated 方案是你的选择。

## 费用

请查看[价格页面](https://greptime.com/pricing)获取最新的定价信息。

### 计算节点

在 Dedicated 方案下创建服务时，你需要配置服务模式并确定计算节点的规格。
Greptime 根据你选择的计划中指定的计算节点按小时计算费用，并按月收费。

费用计算公式：

- 每小时费用：（所选计划的节点规格 * 节点数量 * 节点小时价格）
- 每日费用：每小时费用之和
- 每月费用：每日费用之和

<!--@include: shared-storage-capacity.md-->

### 网络流量

网络流量的费用将包含在你的月度账单中。
流量价格由云服务器提供商（如 AWS）决定，Greptime 不会对流量收取额外费用。
