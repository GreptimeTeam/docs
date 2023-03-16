# QuickStart

## Introduction
This guide shows you how to create an application that use the Java SDK to connect to a 
GreptimeDB server.

The Java SDK lets you connect to and communicate with GreptimeDB server from a Java application.

Consult the following steps to connect your Java application with a GreptimeDB server.

## Set up Your Project

### Install the Java Development Kit(JDK)
Make sure that your system has JDK 8 or later installed. For more information on how to
check your version of Java and install the JDK, see the [Oracle Overview of JDK Installation documentation](https://www.oracle.com/java/technologies/javase-downloads.html)

### Create the Project
This guide demonstrates how to add Java SDK dependencies using Maven. It is advisable to utilize an integrated development environment (IDE) like Intellij IDEA or Eclipse IDE for easier configuration of Maven in building and running your project.

If you are not using an IDE, see [Building Maven](https://maven.apache.org/guides/development/guide-building-maven.html) for more information on how to set up your project.

### Add GreptiemDB Java SDK as a Dependency
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

### Start a GreptiemDB Server
See [Installation](../../installation/overview.md) for more details.

### Create Java Client to Write And Query
Now, we can create a file to contain your application caslled `QuickStart.java` in the base
package directory of you project. Use the following sample code to run a write and a query,
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

        runInsert(greptimeDB);

        runQuery(greptimeDB);
    }

    private static void runInsert(GreptimeDB greptimeDB) throws Exception {
        TableSchema schema =
                TableSchema
                        .newBuilder(TableName.with("public", "monitor"))
                        .semanticTypes(SemanticType.Tag, SemanticType.Timestamp, SemanticType.Field, SemanticType.Field)
                        .dataTypes(ColumnDataType.String, ColumnDataType.TimestampMillisecond, ColumnDataType.Float64,
                                ColumnDataType.Float64) //
                        .columnNames("host", "ts", "cpu", "memory") //
                        .build();

        WriteRows rows = WriteRows.newBuilder(schema).build();
        rows.insert("127.0.0.1", System.currentTimeMillis(), 0.1, null) //
                .insert("127.0.0.2", System.currentTimeMillis(), 0.3, 0.5) //
                .finish();

        // For performance reasons, the SDK is designed to be purely asynchronous.
        // The return value is a future object. If you want to immediately obtain
        // the result, you can call `future.get()`.
        CompletableFuture<Result<WriteOk, Err>> future = greptimeDB.write(rows);

        Result<WriteOk, Err> result = future.get();

        if (result.isOk()) {
            LOG.info("Write result: {}", result.getOk());
        } else {
            LOG.error("Failed to write: {}", result.getErr());
        }
    }

    private static void runQuery(GreptimeDB greptimeDB) throws Exception {
        QueryRequest request = QueryRequest.newBuilder() //
                .exprType(SelectExprType.Sql) //
                .ql("SELECT * FROM monitor;") //
                .build();

        // For performance reasons, the SDK is designed to be purely asynchronous.
        // The return value is a future object. If you want to immediately obtain
        // the result, you can call `future.get()`.
        CompletableFuture<Result<QueryOk, Err>> future = greptimeDB.query(request);

        Result<QueryOk, Err> result = future.get();

        if (result.isOk()) {
            QueryOk queryOk = result.getOk();
            SelectRows rows = queryOk.getRows();
            // `collectToMaps` will discard type information, if type information is needed,
            // please use `collect`.
            List<Map<String, Object>> maps = rows.collectToMaps();
            for (Map<String, Object> map : maps) {
                LOG.info("Query row: {}", map);
            }
        } else {
            LOG.error("Failed to query: {}", result.getErr());
        }
    }
}
```

When you run the QuickStart class, it should output the details of write and query which will look something like this:

```
[main] INFO  QuickStart:88 - Write result: WriteOk{success=2, failure=0, tableName=TableName{databaseName='public', tableName='monitor'}}

[main] INFO  QuickStart:114 - Query row: {memory=null, host=127.0.0.1, cpu=0.1, ts=2023-03-16T07:20:26.043}
[main] INFO  QuickStart:114 - Query row: {memory=null, host=127.0.0.1, cpu=0.1, ts=2023-03-16T07:21:48.050}
[main] INFO  QuickStart:114 - Query row: {memory=null, host=127.0.0.1, cpu=0.1, ts=2023-03-16T07:29:47.780}
[main] INFO  QuickStart:114 - Query row: {memory=0.5, host=127.0.0.2, cpu=0.3, ts=2023-03-16T07:20:26.096}
[main] INFO  QuickStart:114 - Query row: {memory=0.5, host=127.0.0.2, cpu=0.3, ts=2023-03-16T07:21:48.103}
[main] INFO  QuickStart:114 - Query row: {memory=0.5, host=127.0.0.2, cpu=0.3, ts=2023-03-16T07:29:47.882}
```

If you receive no output or an error, check whether you included the proper connection string in your Java class.

After completing this step, you should have a working application that uses the Java SDK to connect to your GreptimeDB,
run a write and a query, and print out the result.
