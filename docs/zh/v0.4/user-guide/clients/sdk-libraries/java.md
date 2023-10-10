# Java

## 安装 Java Development Kit(JDK)

请确认你的系统已经安装了 JDK 8 或者更高版本。更多关于如何检查你的 Java 版本和安装 JDK 的信息，请参考 [Oracle Overview of JDK Installation documentation](https://www.oracle.com/java/technologies/javase-downloads.html)

## 创建项目

该指南演示了如何使用 Maven 添加 Java SDK 依赖项。建议使用集成开发环境（IDE）如 Intellij IDEA 或 Eclipse IDE 来更容易的配置 Maven 以构建和运行你的项目。
如果你没有在使用 IDE，请参考 [Building Maven](https://maven.apache.org/user-guide/development/guide-building-maven.html) 来了解更多关于如何设置你的项目的信息。

## 添加 GreptiemDB Java SDK 作为依赖

如果你正在使用 [Maven](https://maven.apache.org/)，请将以下内容添加到 pom.xml 的依赖项列表中：

```
<dependencies>
    <dependency>
        <groupId>io.greptime</groupId>
        <artifactId>greptimedb-all</artifactId>
        <version>${latest_version}</version>
    </dependency>
</dependencies>
```

可以到[这里](https://central.sonatype.com/search?q=io.greptime)查看最新的版本。

在配置完依赖后，请确保它们可以被你的项目使用，这可能需要在你的 IDE 中刷新项目或者运行依赖管理器。

## 连接数据库

现在创建一个文件 `QuickStart.java` 放在你的项目的基础包目录下。使用下面的示例代码来连接数据库，将 `endpoints` 变量的值替换为你实际的连接地址。

```java
package io.greptime.example;

import io.greptime.GreptimeDB;
import io.greptime.models.AuthInfo;
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
        AuthInfo authInfo = new AuthInfo("username", "password");
        GreptimeOptions opts = GreptimeOptions.newBuilder(endpoint) //
                .authInfo(authInfo) // By default, no authentication is required; you can remove this line.
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

请前往 [Java SDK in reference](/zh/v0.4/reference/sdk/java.md) 获得更多的配置和指标信息。

## 写入数据

请参考 [写入数据](../../write-data/sdk-libraries/java.md).

## 读取数据

请参考 [读取数据](../../query-data/sdk-libraries/java.md).
