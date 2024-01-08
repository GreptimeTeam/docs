---
template: template.md
---
# Java

<docs-template>

{template ingester-lib-installation%

1. Install the Java Development Kit(JDK)

Make sure that your system has JDK 8 or later installed. For more information on how to
check your version of Java and install the JDK, see the [Oracle Overview of JDK Installation documentation](https://www.oracle.com/java/technologies/javase-downloads.html)

2. Add GreptiemDB Java SDK as a Dependency

If you are using [Maven](https://maven.apache.org/), add the following to your pom.xml
dependencies list:

```
<dependencies>
    <dependency>
        <groupId>io.greptime</groupId>
        <artifactId>ingester-all</artifactId>
        <version>${latest_version}</version>
    </dependency>
</dependencies>
```

The latest version can be viewed [here](https://central.sonatype.com/search?q=io.greptime&name=ingester-all).

After configuring your dependencies, make sure they are available to your project. This may require refreshing the project in your IDE or running the dependency manager.

}

{template ingester-lib-connect%

The following code demonstrates how to start an `Ingester`` with all options included. We need to pay attention
to the accompanying comments for each option, as they provide detailed explanations of their respective roles.

```
// GreptimeDB has a default database named "public" in the default catalog "greptime",
// we can use it as the test database
String database = "public";
// By default, GreptimeDB listens on port 4001 using the gRPC protocol.
// We can provide multiple endpoints that point to the same GreptimeDB cluster.
// The client will make calls to these endpoints based on a load balancing strategy.
String[] endpoints = {"127.0.0.1:4001"};
GreptimeOptions opts = GreptimeOptions.newBuilder(endpoints, database) //
        // Optional, the default value is fine.
        //
        // Asynchronous thread pool, which is used to handle various asynchronous
        // tasks in the SDK (You are using a purely asynchronous SDK). If you do not
        // set it, there will be a default implementation, which you can reconfigure
        // if the default implementation is not satisfied.
        // The default implementation is: `SerializingExecutor`
        .asyncPool(new SerializingExecutor("asyncPool"))
        // Optional, the default value is fine.
        //
        // Sets the RPC options, in general, the default configuration is fine.
        .rpcOptions(RpcOptions.newDefault())
        // Optional, the default value is fine.
        //
        // In some case of failure, a retry of write can be attempted.
        // The default is 1
        .writeMaxRetries(1)
        // Optional, the default value is fine.
        //
        // Write flow limit: maximum number of data rows in-flight. It does not take effect on `StreamWriter`
        // The default is 65536
        .maxInFlightWriteRows(65536)
        // Optional, the default value is fine.
        //
        // Write flow limit: the policy to use when the write flow limit is exceeded.
        // All options:
        // - `LimitedPolicy.DiscardPolicy`: discard the data if the limiter is full.
        // - `LimitedPolicy.AbortPolicy`: abort if the limiter is full.
        // - `LimitedPolicy.BlockingPolicy`: blocks if the limiter is full.
        // - `LimitedPolicy.AbortOnBlockingTimeoutPolicy`: blocks the specified time if the limiter is full.
        // The default is `LimitedPolicy.AbortOnBlockingTimeoutPolicy`
        .writeLimitedPolicy(LimitedPolicy.defaultWriteLimitedPolicy())
        // Optional, the default value is fine.
        //
        // The default rate limit for stream writer. It only takes effect when we do not specify the
        // `maxPointsPerSecond` when creating a `StreamWriter`.
        // The default is 10 * 65536
        .defaultStreamMaxWritePointsPerSecond(10 * 65536)
        // Optional, the default value is fine.
        //
        // Refresh frequency of route tables. The background refreshes all route tables
        // periodically. By default, the route tables will not be refreshed.
        .routeTableRefreshPeriodSeconds(-1)
        // Optional, the default value is fine.
        //
        // Sets the request router, The internal default implementation works well.
        // You don't need to set it unless you have special requirements.
        .router(null)
        // Sets authentication information. If the DB is not required to authenticate, we can ignore this.
        .authInfo(AuthInfo.noAuthorization())
        // A good start ^_^
        .build();

GreptimeDB client = GreptimeDB.create(opts);
```

In most cases, the default options work well, so the above code can be simplified to:

```
// GreptimeDB has a default database named "public" in the default catalog "greptime",
// we can use it as the test database
String database = "public";
// By default, GreptimeDB listens on port 4001 using the gRPC protocol.
// We can provide multiple endpoints that point to the same GreptimeDB cluster.
// The client will make calls to these endpoints based on a load balancing strategy.
String[] endpoints = {"127.0.0.1:4001"};
GreptimeOptions opts = GreptimeOptions.newBuilder(endpoints, database)
        // Sets authentication information. If the DB is not required to authenticate, we can ignore this.
        .authInfo(AuthInfo.noAuthorization())
        // A good start ^_^
        .build();

GreptimeDB client = GreptimeDB.create(opts);
```

}

{template row-object%

The Java ingester SDK uses `Row` to represent a row data item. Multiple `Row`s can be added to a `Table` object and then written to GreptimeDB.

}


{template create-a-rows%

```java



```

}

{template create-rows%

```java


```

}


{template save-rows%

```java



```

}

{template update-rows%

```java
// save a row data


// update the row data

// The same tag `host1`

// The same time index `1703832681000`

// The new field value `0.80`

// overwrite the existing data

```
}


{template recommended-query-library%

<!-- We recommend using the [Gorm](https://gorm.io/) library, which is popular and developer-friendly. -->

}

{template query-library-installation%


}

{template query-library-connect%

#### MySQL

```java

```

#### PostgreSQL

```java


```

}

{template query-library-raw-sql%

```java

```

}

{template query-lib-link%

<!-- [GORM](https://gorm.io/docs/index.html) -->

}

</docs-template>
