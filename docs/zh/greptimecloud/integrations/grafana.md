# Grafana

GreptimeCloud 服务可以配置为 [Grafana 数据源](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/)。

## Prometheus

单击"添加数据源”按钮，然后选择“Prometheus”作为类型。

在“HTTP”中填写以下信息：

- Prometheus服务器URL：`https://<host>/v1/prometheus/?db=<dbname>`

在“Auth”部分中单击“basic auth”，并在“Basic Auth Details”中填写你的GreptimeCloud服务用户名和密码：

- 用户：`<username>`
- 密码：*你的GreptimeCloud服务密码*

然后单击“保存并测试”按钮以测试连接。

## MySQL

单击“添加数据源”按钮，然后选择“MySQL”作为类型。在“MySQL Connection”中填写以下信息：

- 主机：`<host>:4002`
- 数据库：`<dbname>`
- 用户：`<username>`
- 密码：*你的GreptimeCloud服务密码*
- 会话时区：`UTC`

然后单击“保存并测试”按钮以测试连接。
