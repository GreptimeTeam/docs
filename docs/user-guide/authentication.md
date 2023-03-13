# Authentication

GreptimeDB has a simple built-in mechanism for authentication, allowing user to config either a fixed account for easy use, or an account file for multiple user accounts.

## Configuration

Authentication happens when a user tries to connect to the database in frontend(or standalone if using standalone mode). Using command line arguments below to config a user `greptime_user` with password `greptime_pwd`.

```shell
cargo run -- standalone start --user-provider=static_user_provider:cmd:greptime_user=greptime_pwd
```

Now, if you try to connect database without username and password, it would fail. Only connection with username `greptime_user` and password `greptime_pwd` would be allowed to connect to the database.

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

Like example above, you can quickly setup a fixed single user authentication configuaration. We will use standalone mode for illustration from now on, but it works both in standalone mode and frontend mode.

```shell
cargo run -- standalone start --user-provider=static_user_provider:cmd:<username>=<password>
```

Replace `username` and `password` with your configured username and password, and it's done!

Single user configuartion is easy to setup and test, but it's not recommanded for any serious situations, for example, production environment.

### Multi-user file configuration

Often times one fixed user isn't really much of a help. GreptimeDB also supports passing in a file and loads all users listed within the file.

```shell
cargo run -- standalone start --user-provider=static_user_provider:file:<path_to_file>
```

GreptimeDB reads user and password each line using `=` for seperater, just like a command line config. For example

```
alice=aaa
bob=bbb
```

Now user `alice` with password `aaa` and user `bob` with password `bbb` is load into GreptimeDB's memory. You can create a connection to GreptimeDB using these user accounts.

## Connecting GreptimeDB with authentication

GreptimeDB supports a varity of connection protocols. It should be fairly easy to attach authentication info when initialzing a connection.

### gRPC

In GreptimeDB's gRPC Request struct, setup [`AuthHeader`](https://github.com/GreptimeTeam/greptime-proto/blob/ad0187295035e83f76272da553453e649b7570de/proto/greptime/v1/database.proto#L21) with `Basic` Authentication scheme using username and password as configured, and you are good to go.

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
HTTP comes with built-in authentication mechanism right away. Setup `Basic` authentication scheme like any other HTTP request, and it's done!

```shell
❯ curl 'http://localhost:4000/v1/sql?sql=show%20tables&db=public' \
        -H 'authorization: Basic Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q='
{"code":0,"output":[{"records":{"schema":{"column_schemas":[{"name":"Tables","data_type":"String"}]},"rows":[["numbers"],["scripts"]]}}],"execution_time_ms":1}
```

`Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=` is `greptime_user:greptime_pwd` processed by base64 encoding, from our very first example user `greptime_user` and password `greptime_pwd`. Remember to replace it with your own configured username and password, and encode it with base64 algorithm.

Note: InfluxDB, due to its compatibility, uses its own authentication format other than the standard basic authentication scheme. Please see below.

### InfluxDB

GreptimeDB is compatible with InfluxDB's line protocol authentication format both v2 and v1. Details are shown below.

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

GreptimeDB also supports InfluxDB's V1 authentication format. Add `u` for user and `p` for password to the HTTP query string like below

```shell
❯ curl 'http://localhost:4000/v1/influxdb/write?db=public&u=greptime_user&p=greptime_pwd' \
    -d 'monitor,host=host2 cpu=1.2 1678679359062504960'
```

Note: replace `greptime_user(username)`, `greptime_pwd(password)` with your configured username and password.

### MySQL

GreptimeDB supports MySQL server protocol like a real MySQL server. Just put username and password parameter to the command line arguments like below

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

Note: replace `greptime_user(username)`, `greptime_pwd(password)` with your configured username and password.

### openTSDB

todo

### PostgreSQL

GreptimeDB also supports PostgreSQL server protocol. Add `-U` arguments to the command(which stands for username and password authentication) and type in password in promt like below

```shell
❯ psql -h localhost -p 4003 -U greptime_user -d public
Password for user greptime_user:
psql (15.2, server 0.1.1)
WARNING: psql major version 15, server major version 0.1.
         Some psql features might not work.
Type "help" for help.

public=>
```

Note: replace `greptime_user(username)`, `greptime_pwd(password)` with your configured username and password.

### Prometheus

GreptimeDB works flowlessly as a prometheus backend. As prometheus has built-in support for setting up basic authentication infomation while configuring remote write and remote read, just add your configured username and password to the config yaml and it's done!

```yaml
remote_write:
- url: http://localhost:4000/v1/prometheus/write?db=prometheus
basic_auth:
    username: greptime_user
    password: greptime_pwd

remote_read:
- url: http://localhost:4000/v1/prometheus/read?db=prometheus
    username: greptime_user
    password: greptime_pwd
```

Note: replace `greptime_user(username)`, `greptime_pwd(password)` with your configured username and password.