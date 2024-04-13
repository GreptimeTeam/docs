# MindsDB

[MindsDB](https://mindsdb.com/) is an open-source machine learning platform that
enables developers to easily incorporate advanced machine learning capabilities
with existing databases.

Your GreptimeDB instance work out of box as using MySQL protocol with
MindsDB. To configure GreptimeDB database, run the following SQL:

```sql
CREATE DATABASE greptime_datasource
WITH ENGINE = 'mysql',
PARAMETERS = {
  "host": "<host>",
  "port": 4002,
  "database": "<dbname>",
  "user": "<username>",
  "password": "<password>",
  "ssl": True
};

```

MindsDB is a great gateway for many machine learning features, including
time-series forecasting, for your time series data stored in our instance. See
[MindsDB docs](https://docs.mindsdb.com/what-is-mindsdb) for more information.
