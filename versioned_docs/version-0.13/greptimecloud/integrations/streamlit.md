---
keywords: [Streamlit, data apps, SQL connection, MySQL protocol, Python]
description: Instructions for using GreptimeCloud with Streamlit to build data apps, including creating a SQL connection and running SQL queries.
---

# Streamlit

Streamlit is a faster way to build and share data apps. It's possible to build
streamlit based data apps based on GreptimeDB.

To use GreptimeDB data in your application, you will need to create a SQL
connection. Thanks to GreptimeDB's MySQL protocol compatibility, you can treat
GreptimeDB as MySQL when connecting to it.

```python
import streamlit as st

st.title('GreptimeDB Streamlit Demo')
conn = st.connection("greptimedb", type="sql", url="mysql://<username>:<password>@<host>:4002/<dbname>")

df = conn.query("SELECT * FROM ...")
```

Once you have created the connection, you can run SQL query against your
GreptimeDB instance. The resultset is automatically converted to Pandas
dataframe just like normal data source in streamlit.
