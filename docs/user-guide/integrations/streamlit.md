---
keywords: [Streamlit, data apps, SQL connection, MySQL protocol, Python]
description: Instructions for using GreptimeCloud with Streamlit to build data apps, including creating a SQL connection and running SQL queries.
---

# Streamlit

[Streamlit](https://streamlit.io/) is a faster way to build and share data apps.
It's possible to build streamlit based data apps based on GreptimeDB.

To use GreptimeDB data in your application, you will need to create a SQL
connection. Thanks to GreptimeDB's [MySQL protocol compatibility](/user-guide/protocols/mysql.md),
you can treat GreptimeDB as MySQL when connecting to it.

Here is an example code snippet to connect to GreptimeDB from Streamlit:

```python
import streamlit as st

st.title('GreptimeDB Streamlit Demo')
conn = st.connection("greptimedb", type="sql", url="mysql://<username>:<password>@<host>:4002/<dbname>")

df = conn.query("SELECT * FROM ...")
```

- The `<host>` is the hostname or IP address of your GreptimeDB instance.
- The `<dbname>` is the name of the database you want to connect to.
- The `<username>` and `<password>` are your [GreptimeDB credentials](/user-guide/deployments-administration/authentication/static.md).

Once you have created the connection, you can run SQL query against your
GreptimeDB instance. The resultset is automatically converted to Pandas
dataframe just like normal data source in streamlit.

