# Serverless Plan

Serverless Plan 允许你超出 Hobby Plan 的限制，并提供 SRE 团队支持。
该解决方案提供无限的数据存储和可配置的数据保留策略，
适用于生产环境，并且可以随着业务的增长而扩展。

当创建 Serverless Plan 新服务或从 Hobby Plan 升级时，
你需要配置容量单元，包括：

- 每秒最大 WCU (Write Capacity Unit)，上限为 5000
- 每秒最大 RCU (Read Capacity Unit)，上限为 5000
- 存储容量

:::tip 注意
请查看 [WCU and RCU](wcu-rcu.md) 了解 WCU 和 RCU 的概念。
:::

## 费用

请查看[价格页面](https://greptime.com/pricing)获取最新的定价信息。

### WCU 和 RCU

Greptime 根据你选择的计划中指定的容量单元按分钟计算费用，并按月收费。

费用计算公式：

- 每分钟费用：（所选计划的 WCU * WCU 每分钟价格） + （所选计划的 RCU * RCU 每分钟价格）
- 每小时费用：每分钟费用之和
- 每日费用：每小时费用之和
- 每月费用：每日费用之和

<!--@include: shared-storage-capacity.md-->

<!-- ### 优化费用

以下是一些优化费用的建议：

- 选择适当的容量单元以避免为未使用的容量支付过多费用。
- 设置数据保留策略以删除不必要的数据并减少存储费用。 -->
