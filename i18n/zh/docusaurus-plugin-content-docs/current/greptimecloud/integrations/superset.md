# Superset

[Apache Superset](https://superset.apache.org) 是开源的 BI 工具，用 Python 编写。
以下内容可以帮助你把 GreptimeDB 作为 Superset 的数据源。

关于插件的安装，请[查看文
档](https://docs.greptime.com/nightly/user-guide/integrations/superset).

## 连接信息

从数据库列表中选择 `GreptimeDB`。

填写以下 URL

```
greptimedb://<username>:<password>@<host>:4003/<dbname>
```
