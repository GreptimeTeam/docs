# Streamlit

Streamlit 是一套快速构建数据应用的 Python 框架，目前他也支持构建基于 GreptimeDB
的数据应用。

我们可以通过 Streamlit 的 SQL 连接来创建到 GreptimeDB 的通道。由于 GreptimeDB 兼
容 MySQL 协议，因此可以将 GreptimeDB 看作一个 MySQL 实例来进行连接。

```python
import streamlit as st

st.title('GreptimeDB Streamlit Demo')
conn = st.connection("greptimedb", type="sql", url="mysql://<username>:<password>@<host>:4002/<dbname>")

df = conn.query("SELECT * FROM ...")
```

完成连接后，就可以直接执行 GreptimeDB 的 SQL 查询。和其他 Streamlit 的数据源一样，
结果集将被自动转换成 Pandas 格式用于其他 Streamlit 接口。
