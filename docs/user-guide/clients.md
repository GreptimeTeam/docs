# Clients

You can read from or write into GreptimeDB using various protocols.

![protocols](../public/b8fade22-59b2-42a8-aab9-a79cdca36d27.png)

Note that writing data in a specific protocol does not mean that you
have to read data with the same protocol. For example, you can write
data through gRPC endpoint while using MySQL client to read them.

## Authentication

GreptimeDB has a simple built-in mechanism for authentication, allowing users to config either a fixed account for handy usage, or an account file for multiple user accounts.

Authentication happens when a user tries to connect to the database in the frontend (or standalone if using standalone mode). GreptimeDB supports passing in a file and loads all users listed within the file. GreptimeDB reads the user and password on each line using `=` as a separator, just like a command-line config. For example:

```
greptime_user=greptime_pwd
alice=aaa
bob=bbb
```

then start server with user provider

```shell
./greptime standalone start --user-provider=static_user_provider:file:<path_to_file>
```

Now, user `alice` with password `aaa` and user `bob` with password `bbb` are loaded into GreptimeDB's memory. You can create a connection to GreptimeDB using these user accounts.

Note: The content of the file is loaded into the database while starting up. Modifying or appending the file won't take effect while the database is up and running.

## Connect
Now you can connect database via multiple protocols.

### MySQL

use `-u` param to set username, use `-p` to indicate password. Be sure to replace `greptime_user(username)` and `greptime_pwd(password)` with your own username and password.

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

### gRPC
<!-- 
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

Note: replace `greptime(catalog)`, `public(schema)`, `greptime_user(username)`, `greptime_pwd(password)` with your configured infomation. -->

Note: At the moment, the authentication of SDKs of gPRC is not yet supported. You can connect the GreptimeDB directly.

#### Java SDK

##### Install the Java Development Kit(JDK)
Make sure that your system has JDK 8 or later installed. For more information on how to
check your version of Java and install the JDK, see the [Oracle Overview of JDK Installation documentation](https://www.oracle.com/java/technologies/javase-downloads.html)

##### Create the Project
This guide demonstrates how to add Java SDK dependencies using Maven. It is advisable to utilize an integrated development environment (IDE) like Intellij IDEA or Eclipse IDE for easier configuration of Maven in building and running your project.

If you are not using an IDE, see [Building Maven](https://maven.apache.org/user-guide/development/guide-building-maven.html) for more information on how to set up your project.

##### Add GreptiemDB Java SDK as a Dependency
If you are using [Maven](https://maven.apache.org/), add the following to your pom.xml
dependencies list:

```
<dependencies>
    <dependency>
        <groupId>io.greptime</groupId>
        <artifactId>greptimedb-all</artifactId>
        <version>${latest_version}</version>
    </dependency>
</dependencies>
```
The latest version can be viewed [here](https://central.sonatype.com/search?q=io.greptime).

After configuring your dependencies, make sure they are available to your project. This may require refreshing the project in your IDE or running the dependency manager.

##### Connect database

Now, we can create a file to contain your application called `QuickStart.java` in the base
package directory of you project. Use the following sample code to connect database,
replacing the value of `endpoints` variable with your real connection string.

```java
package io.greptime.example;

import io.greptime.GreptimeDB;
import io.greptime.models.ColumnDataType;
import io.greptime.models.Err;
import io.greptime.models.QueryOk;
import io.greptime.models.QueryRequest;
import io.greptime.models.Result;
import io.greptime.models.SelectExprType;
import io.greptime.models.SelectRows;
import io.greptime.models.SemanticType;
import io.greptime.models.TableName;
import io.greptime.models.TableSchema;
import io.greptime.models.WriteOk;
import io.greptime.models.WriteRows;
import io.greptime.options.GreptimeOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * @author jiachun.fjc
 */
public class QuickStart {

    private static final Logger LOG = LoggerFactory.getLogger(QuickStart.class);

    public static void main(String[] args) throws Exception {
        String endpoint = "127.0.0.1:4001";
        GreptimeOptions opts = GreptimeOptions.newBuilder(endpoint) //
                .writeMaxRetries(1) //
                .readMaxRetries(2) //
                .routeTableRefreshPeriodSeconds(-1) //
                .build();

        GreptimeDB greptimeDB = new GreptimeDB();

        if (!greptimeDB.init(opts)) {
            throw new RuntimeException("Fail to start GreptimeDB client");
        }
    }
}
```

See [Java SDK in reference](/reference/sdk/java.go) to get more configurations and metrics.

<!-- #### Go SDK
TODO -->

### HTTP API
HTTP comes with a built-in authentication mechanism. To set up `Basic` authentication scheme like any other HTTP request, do the following:

1. Encode your username and password using `Base64` algorithm.
2. Attach your encoded credentials to the HTTP request header using the format `Authorization: Basic <base64-encoded-credentials>`.

Here's an example:

```shell
curl -X POST \
-H 'Authorization: Basic Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'sql=show tables' \
http://localhost:4000/v1/sql?db=public
```

```json
{
  "code": 0,
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "Tables",
              "data_type": "String"
            }
          ]
        },
        "rows": [
          ["numbers"],
          ["scripts"]
        ]
      }
    }
  ],
  "execution_time_ms": 1
}
```

* `Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=` is `greptime_user:greptime_pwd` encoded using Base64. Remember to replace it with your own configured username and password and encode them using Base64. 
* The `public` in the URL is the name of your database, which is required with authorization.

**Note: InfluxDB uses its own authentication format, which is different from the standard Basic authentication scheme. See below for details.**

### InfluxDB

GreptimeDB is compatible with InfluxDB's line protocol authentication format, both v1 and v2.

**[V2 protocol](https://docs.influxdata.com/influxdb/v1.8/tools/api/?t=Auth+Enabled#apiv2query-http-endpoint)**

InfluxDB's V2 protocol uses a format much like HTTP's standard basic authentication scheme. We can write data easily through InfluxDB's line protcol.

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

#### PING

Additionally, GreptimeDB also provides support for the `ping` and `health` APIs of InfluxDB.

Use `curl` to request `ping` API.

```shell
curl -i "127.0.0.1:4000/v1/influxdb/ping"
```

```shell
HTTP/1.1 204 No Content
date: Wed, 22 Feb 2023 02:29:44 GMT
```

Use `curl` to request `health` API.

```shell
curl -i "127.0.0.1:4000/v1/influxdb/health"
```

```shell
HTTP/1.1 200 OK
content-length: 0
date: Wed, 22 Feb 2023 02:30:46 GMT
```

### OpenTSDB

#### Telnet

> Note: At the moment, authentication of OpenTSDB protocol over TCP is not yet supported. If there is a authentication with GreptimeDB, please use HTTP endpoints.

The GreptimeDB is listening on port `4242` by default to receive metrics via `telnet`. You can open
your favorite terminal and type `telnet 127.0.0.1 4242` to connect to GreptimeDB.

```shell
~ % telnet 127.0.0.1 4242
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
put sys.cpu.system 1667892080 3 host=web01 dc=hz
quit
Connection closed by foreign host.
~ %
```

#### HTTP API

To set up `Basic` authentication scheme like any other HTTP request, please refer to [HTTP API](#http-api). To write data to GreptimeDB, please refer to [write data](./write-data.md#opentsdb-line-protocol).

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
