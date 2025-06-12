---
keywords: [Streamlit, 数据应用, SQL 连接, MySQL 协议, Python]
description: 使用 GreptimeCloud 和 Streamlit 构建数据应用的说明，包括创建 SQL 连接和运行 SQL 查询。
---

# Streamlit

[Streamlit](https://streamlit.io/) 是一种更快的构建和分享数据应用的方式。
可以基于 GreptimeDB 构建基于 Streamlit 的数据应用。

你需要创建一个 SQL 连接在应用程序中使用 GreptimeDB 数据。
由于 GreptimeDB 的 [MySQL 协议兼容性](/user-guide/protocols/mysql.md)，你可以在连接时将 GreptimeDB 视为 MySQL。

以下是从 Streamlit 连接到 GreptimeDB 的示例代码片段：

```python
import streamlit as st

st.title('GreptimeDB Streamlit 演示')
conn = st.connection("greptimedb", type="sql", url="mysql://<username>:<password>@<host>:4002/<dbname>")

df = conn.query("SELECT * FROM ...")
```

- `<host>` 是 GreptimeDB 实例的主机名或 IP 地址。
- `<dbname>` 是要连接的数据库的名称。
- `<username>` 和 `<password>` 是 [GreptimeDB 鉴权认证信息](/user-guide/deployments-administration/authentication/static.md)。

创建连接后，你可以对 GreptimeDB 实例运行 SQL 查询。结果集会自动转换为 Pandas dataframe，就像在 Streamlit 中使用普通数据源一样。
