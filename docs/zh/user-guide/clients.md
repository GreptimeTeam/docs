# Clients

用户可以使用各种协议从 GreptimeDB 读取或写入。

![protocols](../../public/b8fade22-59b2-42a8-aab9-a79cdca36d27.png)

请注意，以特定的协议写入数据并不意味着必须以相同的协议读取数据。例如，可以通过 gRPC 端点写数据，同时使用 MySQL 客户端来读取它们。

## 身份认证

GreptimeDB 有一个简单的内置认证机制，允许用户配置一个固定的账户以方便使用，或者一个账户文件来管理多个用户账户。

当用户试图连接到前台的数据库时（或者使用单机模式时），就会进行认证。GreptimeDB 支持传入一个文件并加载该文件中列出的所有用户。就像命令行配置一样，GreptimeDB 使用 `=` 作为分隔符在每一行中读取用户和密码。

比如：

```
greptime_user=greptime_pwd
alice=aaa
bob=bbb
```

然后通过用户提供者启动服务器

```shell
./greptime standalone start --user-provider=static_user_provider:file:<path_to_file>
```

现在，密码为 `aaa` 的用户 `alice` 和密码为 `bbb` 的用户 `bob` 被加载到 GreptimeDB 的内存中。可以使用这些用户账号创建与 GreptimeDB 的连接。

注意：文件的内容是在启动的时候加载到数据库中的。在数据库启动和运行时，对文件的修改或追加不会生效。

## 连接

现在可以通过多种协议连接数据库。

### MySQL

使用 `-u` 参数来设置用户名，使用 `-p` 来表示密码。请确保用自己的用户名和密码替换 `greptime_user(username)` 和 `greptime_pwd(password)`。

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

注意: 目前我们还不支持对 gPRC 的 SDK 进行认证，用户可以使用无鉴权的方式直接连接 GreptimeDB。

#### Java SDK

##### 安装 Java 开发工具包(JDK)

请确保使用 JDK 8 或更高版本。想了解更多关于如何检查 Java 版本和安装 JDK 的信息，请参考 [Oracle JDK 安装概述文档](https://www.oracle.com/java/technologies/javase-downloads.html)

##### 创建项目

本指南演示了如何使用 Maven 添加 Java SDK 依赖项。建议利用 Intellij IDEA 或 Eclipse IDE 等集成开发环境（IDE），以便在构建和运行项目时更容易配置 Maven。

如果没有使用 IDE，请参考 [Building Maven](https://maven.apache.org/user-guide/development/guide-building-maven.html)，了解更多关于如何设置项目的信息。

##### 添加 GreptiemDB Java SDK 作为依赖项

如果使用的是 [Maven](https://maven.apache.org/)，请将以下内容添加到 pom.xml 的依赖项列表中：

```
<dependencies>
    <dependency>
        <groupId>io.greptime</groupId>
        <artifactId>greptimedb-all</artifactId>
        <version>${latest_version}</version>
    </dependency>
</dependencies>
```

最新的版本可以查看[这里](https://central.sonatype.com/search?q=io.greptime)。

配置好依赖关系后，确保它们对项目是可用的。这可能需要在 IDE 中刷新项目或运行依赖性管理器。

##### 连接数据库

现在，可以在项目的基础包目录下创建一个包含你的应用程序的文件，名为 `QuickStart.java`。使用下面的示例代码来连接数据库，将 `endpoints` 变量的值替换成真正的连接字符串。

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

通过 [Java SDK in reference](/reference/sdk/java.md) 获得更多配置和指标。

#### Go SDK

##### 安装

```sh
go get github.com/GreptimeTeam/greptimedb-client-go
```

##### 创建客户端

```go
package example

import (
    greptime "github.com/GreptimeTeam/greptimedb-client-go"
    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials/insecure"
)

func InitClient() *greptime.Client {
    options := []grpc.DialOption{
        grpc.WithTransportCredentials(insecure.NewCredentials()),
    }
    // To connect a database that needs authentication, for example, those on Greptime Cloud,
    // `Username` and `Password` are needed when connecting to a database that requires authentication.
    // Leave the two fields empty if connecting a database without authentication.
    cfg := greptime.NewCfg("127.0.0.1").
        WithDatabase("public").      // change to your real database
        WithPort(4001).              // default port
        WithAuth("", "").            // `Username` and `Password`
        WithDialOptions(options...). // specify your gRPC dail options
        WithCallOptions()            // specify your gRPC call options

    client, err := greptime.NewClient(cfg)
    if err != nil {
        panic("failed to init client")
    }
    return client
}
```

通过 [Go SDK in reference](/reference/sdk/go.md) 获得更多配置。

### HTTP API

HTTP API 使用内置的 `Basic` 认证方式，请执行以下操作：

1. 使用 `Base64` 算法对用户名和密码进行编码。
2. 使用 `Authorization: Basic <base64-encoded-credentials>` 格式将 base64 编码的凭证附在 HTTP 请求标头中。

下面是一个例子：

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
        "rows": [["numbers"], ["scripts"]]
      }
    }
  ],
  "execution_time_ms": 1
}
```

- `Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=` 是 `greptime_user:greptime_pwd` 使用 Base64 编码后的字符串。记得用用户自己配置的用户名和密码替换它，并使用 Base64 编码。
- URL 中的 `public` 是用户的数据库的名称，这是授权时需要的。

**注意：InfluxDB 使用其自己的认证格式，与标准的 Basic 认证方案不同。详情见下文**。

### InfluxDB

GreptimeDB 与 InfluxDB 的行协议认证格式兼容，包括 v1 和 v2。

**[V2 protocol](https://docs.influxdata.com/influxdb/v1.8/tools/api/?t=Auth+Enabled#apiv2query-http-endpoint)**

InfluxDB 的 V2 协议使用的格式很像 HTTP 的标准基本认证方案，我们可以通过 InfluxDB 的行协议轻松写入数据。

```shell
❯ curl 'http://localhost:4000/v1/influxdb/write?db=public' \
    -H 'authorization: token greptime_user:greptime_pwd' \
    -d 'monitor,host=host1 cpu=1.2 1664370459457010101'
```

注意：将 `greptime_user(username)`, `greptime_pwd(password)` 替换为用户自己配置的用户名和密码。

**[V1 protocol](https://docs.influxdata.com/influxdb/v1.8/tools/api/?t=Auth+Enabled#query-string-parameters-1)**

GreptimeDB 也支持 InfluxDB 的 V1 认证格式。在 HTTP 查询字符串中添加 `u` 代表用户，`p` 代表密码，如下所示：

```shell
❯ curl 'http://localhost:4000/v1/influxdb/write?db=public&u=greptime_user&p=greptime_pwd' \
    -d 'monitor,host=host2 cpu=1.2 1678679359062504960'
```

注意：将 `greptime_user(username)`, `greptime_pwd(password)` 替换为用户自己配置的用户名和密码。

#### PING

此外，GreptimeDB 还提供对 InfluxDB 的 `ping` 和 `health` API 的支持。

使用 `curl` 来请求 `ping` API。

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

> 注意：目前我们还不支持通过 TCP 的 OpenTSDB 协议的认证。如果有 GreptimeDB 的认证，请使用 HTTP 接口。

GreptimeDB 默认监听端口为 `4242`，通过 `telnet` 接收指标。可以打开命令行工具输入 `telnet 127.0.0.1 4242` 来连接到 GreptimeDB。

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

要像其他 HTTP 请求一样设置 `Basic` 认证方案，请参考 [HTTP API](#http-api)。要向 GreptimeDB 写入数据，请参考 [数据写入](./write-data.md#opentsdb-line-protocol)。

### PostgreSQL

GreptimeDB 也支持 PostgreSQL 服务器协议! 想要使用它，只需在命令中添加 `-U` 参数，然后是用户的用户名和密码。

比如：

```shell
❯ psql -h localhost -p 4003 -U greptime_user -d public
Password for user greptime_user:
psql (15.2, server 0.1.1)
WARNING: psql major version 15, server major version 0.1.
         Some psql features might not work.
Type "help" for help.

public=>
```

注意：确保用用户自己的用户名和密码替换 `greptime_user(用户名)` 和 `greptime_pwd(密码)`。
