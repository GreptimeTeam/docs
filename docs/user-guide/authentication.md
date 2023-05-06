# Authentication

GreptimeDB has a simple built-in mechanism for authentication, allowing users to config either a fixed account for handy usage, or an account file for multiple user accounts.

## Configuration

Authentication happens when a user tries to connect to the database in the frontend (or standalone if using standalone mode). Use the following command-line arguments to config a user `greptime_user` with the password `greptime_pwd`.

```shell
./greptime standalone start --user-provider=static_user_provider:cmd:greptime_user=greptime_pwd
```

Now, if you try to connect to the database without a username and password, it would fail. Only the connection with the username `greptime_user` and password `greptime_pwd` would be allowed to connect to the database.

```shell
❯ mysql -h 127.0.0.1 -P 4002 -u greptime_user -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 5.1.10-alpha-msql-proxy Greptime

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

### Single user configuration

Like the example above, you can quickly set up a fixed single-user authentication configuration. We will use standalone mode for illustration from now on, but it works both in standalone mode and distributed mode.

```shell
./greptime standalone start --user-provider=static_user_provider:cmd:<username>=<password>
```

Replace `username` and `password` with your configured username and password, and it's done!

Single user configuartion is easy to setup and test, but it's not recommanded for any serious situations, for example, a production environment.

### Multi-user file configuration

Frequently, having only one specific user isn't particularly useful. GreptimeDB also allows for the input of a file which then loads all users listed within it.

```shell
./greptime standalone start --user-provider=static_user_provider:file:<path_to_file>
```

GreptimeDB reads the user and password on each line using `=` as a separator, just like a command-line config. For example:

```
alice=aaa
bob=bbb
```

Now, user `alice` with password `aaa` and user `bob` with password `bbb` are loaded into GreptimeDB's memory. You can create a connection to GreptimeDB using these user accounts.

Note: The content of the file is loaded into the database while starting up. Modifying or appending the file won't take effect while the database is up and running.

## Connecting GreptimeDB with authentication

GreptimeDB supports various connection protocols, and it's easy to attach authentication information while initializing a connection.

### gRPC

In GreptimeDB's gRPC Request struct, set up [`AuthHeader`](https://github.com/GreptimeTeam/greptime-proto/blob/ad0187295035e83f76272da553453e649b7570de/proto/greptime/v1/database.proto#L21) with `Basic` Authentication scheme using username and password as configured, and you are good to go.

To set up `Basic` authentication scheme using a username and password, configure the [AuthHeader](https://github.com/GreptimeTeam/greptime-proto/blob/ad0187295035e83f76272da553453e649b7570de/proto/greptime/v1/database.proto#L21) when initializing a connection. You can achieve this by setting up the `AuthHeader` in GreptimeDB's gRPC request struct, as shown below.


```Rust
let request_header = RequestHeader {
    catalog: "greptime".to_string(),
    schema: "public".to_string(),
    authorization: Some(AuthHeader {
        auth_scheme: Some(AuthScheme::Basic(Basic {
            username: "greptime_user".to_string(),
            password: "greptime_password".to_string(),
        })),
    }),
};
```

Note: replace `greptime(catalog)`, `public(schema)`, `greptime_user(username)`, `greptime_pwd(password)` with your configured infomation.

### HTTP api
HTTP comes with a built-in authentication mechanism. To set up `Basic` authentication scheme like any other HTTP request, do the following:

1. Encode your username and password using `Base64` algorithm.
2. Attach your encoded credentials to the HTTP request header using the format `Authorization: Basic <base64-encoded-credentials>`.

Here's an example:
```shell
❯ curl 'http://localhost:4000/v1/sql?sql=show%20tables&db=public' \
        -H 'authorization: Basic Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q='
{"code":0,"output":[{"records":{"schema":{"column_schemas":[{"name":"Tables","data_type":"String"}]},"rows":[["numbers"],["scripts"]]}}],"execution_time_ms":1}
```

`Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=` is `your_username:your_password` encoded using Base64. Remember to replace it with your own configured username and password and encode them using Base64.

Note: InfluxDB uses its own authentication format, which is different from the standard Basic authentication scheme. See below for details.

### InfluxDB

GreptimeDB is compatible with InfluxDB's line protocol authentication format, both v1 and v2.

**[V2 protocol](https://docs.influxdata.com/influxdb/v1.8/tools/api/?t=Auth+Enabled#apiv2query-http-endpoint)**

InfluxDB's V2 protocol uses a format much like HTTP's standard basic authentication scheme. We can create a `monitor` table and write data easily through InfluxDB's line protcol.

```SQL
CREATE TABLE monitor (
  host STRING,
  ts TIMESTAMP,
  cpu DOUBLE DEFAULT 0,
  memory DOUBLE,
  TIME INDEX (ts),
  PRIMARY KEY(host)) ENGINE=mito WITH(regions=1);
```

```shell
❯ curl 'http://localhost:4000/v1/influxdb/write?db=public' \
    -H 'authorization: token greptime_user:greptime_pwd' \
    -d 'monitor,host=host1 cpu=1.2 1664370459457010101'
```

Note: replace `greptime_user(username)`, `greptime_pwd(password)` with your configured username and password.

**[V1 protocol](https://docs.influxdata.com/influxdb/v1.8/tools/api/?t=Auth+Enabled#query-string-parameters-1)**

GreptimeDB also supports InfluxDB's V1 authentication format. Add `u` for user and `p` for password to the HTTP query string as shown below:

```shell
❯ curl 'http://localhost:4000/v1/influxdb/write?db=public&u=greptime_user&p=greptime_pwd' \
    -d 'monitor,host=host2 cpu=1.2 1678679359062504960'
```

Note: replace `greptime_user(username)`, `greptime_pwd(password)` with your configured username and password.

### MySQL

At GreptimeDB, we make it easy for you to use our MySQL server protocol! Simply add your username and password as command line arguments when you run the MySQL command. Here's an example:

```shell
❯ mysql -h 127.0.0.1 -P 4002 -u greptime_user -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 5.1.10-alpha-msql-proxy Greptime

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

Note: Be sure to replace `greptime_user(username)` and `greptime_pwd(password)` with your own username and password.

### openTSDB

At the moment, authentication of openTSDB protocol over TCP is not yet supported. However, if you're using openTSDB over HTTP, you can refer to the HTTP API section for more information.

### PostgreSQL

GreptimeDB also supports PostgreSQL server protocol! To get started, simply add the `-U` argument to your command, followed by your username and password. Here's an example:

```shell
❯ psql -h localhost -p 4003 -U greptime_user -d public
Password for user greptime_user:
psql (15.2, server 0.1.1)
WARNING: psql major version 15, server major version 0.1.
         Some psql features might not work.
Type "help" for help.

public=>
```

Note: Be sure to replace `greptime_user(username)` and `greptime_pwd(password)` with your own username and password.

### Prometheus

Using GreptimeDB as a Prometheus backend is a seamless experience. Since Prometheus has built-in support for setting up basic authentication information during the configuration of remote write and read, all you need to do is add your configured username and password to the config YAML file and you're good to go!"

```yaml
remote_write:
- url: http://localhost:4000/v1/prometheus/write?db=prometheus
- basic_auth:
    username: greptime_user
    password: greptime_pwd

remote_read:
- url: http://localhost:4000/v1/prometheus/read?db=prometheus
- basic_auth:
    username: greptime_user
    password: greptime_pwd
```

Note: Be sure to replace `greptime_user(username)`, `greptime_pwd(password)` with your own username and password.
