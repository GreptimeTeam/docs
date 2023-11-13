# 快速设置

GreptimeCloud 与 GreptimeDB 完全兼容 Prometheus。这意味着你可以无缝地将 GreptimeCloud 用作 Prometheus 存储和查询的替代品。有关更多信息，请参阅 GreptimeDB 用户指南中的 [Prometheus 文档](https://docs.greptime.cn/user-guide/clients/prometheus)。

## 远程写入和读取

GreptimeCloud 实例可以配置为 Prometheus 的[远程写入端点](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_write)和[远程读取端点](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_read)。

将以下部分添加到你的 prometheus 配置中：

```yaml
remote_write:
  - url: https://<host>/v1/prometheus/write?db=<dbname>
    basic_auth:
      username: <username>
      password: <password>

remote_read:
  - url: https://<host>/v1/prometheus/read?db=<dbname>
    basic_auth:
      username: <username>
      password: <password>
```

## 规则管理

每个 GreptimeCloud 服务都带有一个 Git 存储库，用于存储 Prometheus 的规则和配置。GreptimeCloud 的 Prometheus 兼容规则引擎会根据存储在数据库中的数据评估你的规则，并在匹配时发出警报。有关更多详细信息，请参阅[规则管理](https://docs.greptime.cn/greptimecloud/integrations/prometheus/rule-management)。

```shell
git clone https://<host>/promrules/git/<dbname>.git
# Copy your prometheus.yml and rules into this repo, and commit them
git add .
git commit -m "sync prometheus configuration"
git push
```

## PromQL

GreptimeDB 支持 PromQL (Prometheus 查询语言)，这意味着你可以将 GreptimeDB 作为 Prometheus 查询的替代品。有关更多详细信息，请参考 [PromQL](https://docs.greptime.cn/user-guide/prometheus#prometheus-query-language)。
