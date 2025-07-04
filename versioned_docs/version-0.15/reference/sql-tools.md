---
keywords: [SQL tools, JDBC, GORM, database connection, Java, Go, SQL queries, installation]
description: Guide on using SQL tools with GreptimeDB, including recommended libraries, installation, connection setup, and usage examples for Java and Go.
---

# SQL Tools

GreptimeDB uses SQL as its main query language and supports many popular SQL tools.
This document guides you on how to use SQL tools with GreptimeDB.

## Language drivers

It is recommended to use mature SQL drivers to query data.

### Recommended libraries

<Tabs groupId="programming-langs">
  <TabItem value="Java" label="Java">
    Java Database Connectivity (JDBC) is the JavaSoft specification of a standard application programming interface (API) that allows Java programs to access database management systems.

    Many databases, such as MySQL or PostgreSQL, have implemented their own drivers based on the JDBC API.
    Since GreptimeDB supports [multiple protocols](/user-guide/protocols/overview.md), we use MySQL as an example to demonstrate how to use JDBC.
    If you want to use other protocols, just replace the MySQL driver with the corresponding driver.
  </TabItem>
  <TabItem value="Go" label="Go">
    It is recommended to use the [GORM](https://gorm.io/) library, which is popular and developer-friendly.
  </TabItem>
</Tabs>

### Installation

<Tabs groupId="programming-langs">
  <TabItem value="Java" label="Java">
    If you are using [Maven](https://maven.apache.org/), add the following to your `pom.xml` dependencies list:

    ```xml
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.33</version>
    </dependency>
    ```
  </TabItem>

  <TabItem value="Go" label="Go">
    Use the following command to install the GORM library:

    ```shell
    go get -u gorm.io/gorm
    ```

    Then install the MySQL driver:

    ```shell
    go get -u gorm.io/driver/mysql
    ```

    Import the libraries in your code:

    ```go
    import (
        "gorm.io/gorm"
        "gorm.io/driver/mysql"
    )
    ```
  </TabItem>
</Tabs>

### Connect to database

The following use MySQL as an example to demonstrate how to connect to GreptimeDB.

<Tabs groupId="programming-langs">
  <TabItem value="Java" label="Java">
    ```java
    public static Connection getConnection() throws IOException, ClassNotFoundException, SQLException {
        Properties prop = new Properties();
        prop.load(QueryJDBC.class.getResourceAsStream("/db-connection.properties"));

        String dbName = (String) prop.get("db.database-driver");
        String dbConnUrl = (String) prop.get("db.url");
        String dbUserName = (String) prop.get("db.username");
        String dbPassword = (String) prop.get("db.password");

        Class.forName(dbName);
        Connection dbConn = DriverManager.getConnection(dbConnUrl, dbUserName, dbPassword);

        return Objects.requireNonNull(dbConn, "Failed to make connection!");
    }
    ```

    You need a properties file to store the DB connection information. Place it in the resources directory and name it `db-connection.properties`. The file content is as follows:

    ```txt
    # DataSource
    db.database-driver=com.mysql.cj.jdbc.Driver
    db.url=jdbc:mysql://localhost:4002/public
    db.username=
    db.password=
    ```

    Or you can get the file from [here](https://github.com/GreptimeTeam/greptimedb-ingester-java/blob/main/ingester-example/src/main/resources/db-connection.properties).
  </TabItem>
  <TabItem value="Go" label="Go">
    ```go
    type Mysql struct {
      Host     string
      Port     string
      User     string
      Password string
      Database string

      DB *gorm.DB
    }

    m := &Mysql{
        Host:     "127.0.0.1",
        Port:     "4002", // default port for MySQL
        User:     "username",
        Password: "password",
        Database: "public",
    }

    dsn := fmt.Sprintf("tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
        m.Host, m.Port, m.Database)
    dsn = fmt.Sprintf("%s:%s@%s", m.User, m.Password, dsn)
    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
    if err != nil {
        // error handling 
    }
    m.DB = db
    ```
  </TabItem>
</Tabs>

#### Time zone

<Tabs groupId="programming-langs">
  <TabItem value="Java" label="Java">
    Set the JDBC time zone by setting URL parameters:

    ```txt
    jdbc:mysql://127.0.0.1:4002?connectionTimeZone=Asia/Shanghai&forceConnectionTimeZoneToSession=true
    ```

    * `connectionTimeZone={LOCAL|SERVER|user-defined-time-zone}` specifies the connection time zone.
    * `forceConnectionTimeZoneToSession=true` sets the session `time_zone` variable to the value specified in `connectionTimeZone`. 
  </TabItem>
  <TabItem value="Go" label="Go">
    Set the time zone in the DSN. For example, set the time zone to `Asia/Shanghai`:

    ```go
    dsn := fmt.Sprintf("tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local&time_zone=%27Asia%2FShanghai%27",
        m.Host, m.Port, m.Database)
    ```

    For more information, see the [MySQL Driver Documentation](https://github.com/go-sql-driver/mysql?tab=readme-ov-file#system-variables).
  </TabItem>
</Tabs>

### Raw SQL

It is recommended to use raw SQL to experience the full features of GreptimeDB.
The following example shows how to use raw SQL to query data.

<Tabs groupId="programming-langs">
  <TabItem value="Java" label="Java">
    ```java
    try (Connection conn = getConnection()) {
      Statement statement = conn.createStatement();

      // DESC table;
      ResultSet rs = statement.executeQuery("DESC cpu_metric");
      LOG.info("Column | Type | Key | Null | Default | Semantic Type ");
      while (rs.next()) {
        LOG.info("{} | {} | {} | {} | {} | {}",
            rs.getString(1),
            rs.getString(2),
            rs.getString(3),
            rs.getString(4),
            rs.getString(5),
            rs.getString(6));
      }

      // SELECT COUNT(*) FROM cpu_metric;
      rs = statement.executeQuery("SELECT COUNT(*) FROM cpu_metric");
      while (rs.next()) {
        LOG.info("Count: {}", rs.getInt(1));
      }

      // SELECT * FROM cpu_metric ORDER BY ts DESC LIMIT 5;
      rs = statement.executeQuery("SELECT * FROM cpu_metric ORDER BY ts DESC LIMIT 5");
      LOG.info("host | ts | cpu_user | cpu_sys");
      while (rs.next()) {
        LOG.info("{} | {} | {} | {}",
            rs.getString("host"),
            rs.getTimestamp("ts"),
            rs.getDouble("cpu_user"),
            rs.getDouble("cpu_sys"));
      }
    }
    ```

    For the complete code of the demo, please refer to [here](https://github.com/GreptimeTeam/greptimedb-ingester-java/blob/main/ingester-example/src/main/java/io/greptime/QueryJDBC.java).
  </TabItem>
  <TabItem value="Go" label="Go">
    The following code declares a GORM object model:
    
    ```go
    type CpuMetric struct {
        Host        string    `gorm:"column:host;primaryKey"`
        Ts          time.Time `gorm:"column:ts;primaryKey"`
        CpuUser     float64   `gorm:"column:cpu_user"`
        CpuSys      float64   `gorm:"column:cpu_sys"`
    }
    ```
    
    If you are using the [High-level API](/user-guide/ingest-data/for-iot/grpc-sdks/go.md#high-level-api) to insert data, you can declare the model with both GORM and GreptimeDB tags.
    
    ```go
    type CpuMetric struct {
        Host        string    `gorm:"column:host;primaryKey" greptime:"tag;column:host;type:string"`
        Ts          time.Time `gorm:"column:ts;primaryKey"   greptime:"timestamp;column:ts;type:timestamp;precision:millisecond"`
        CpuUser     float64   `gorm:"column:cpu_user"        greptime:"field;column:cpu_user;type:float64"`
        CpuSys      float64   `gorm:"column:cpu_sys"         greptime:"field;column:cpu_sys;type:float64"`
    }
    ```
    
    Declare the table name as follows:
    
    ```go
    func (CpuMetric) TableName() string {
      return "cpu_metric"
    }
    ```
    
    Use raw SQL to query data:
    
    ```go
    var cpuMetric CpuMetric
    db.Raw("SELECT * FROM cpu_metric LIMIT 10").Scan(&result)
    ```
  </TabItem>
</Tabs>

### Query library reference

For more information about how to use the query library, please see the documentation of the corresponding library:

<Tabs groupId="programming-langs">
  <TabItem value="Java" label="Java">
    - [JDBC Online Tutorials](https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html)
  </TabItem>
  <TabItem value="Go" label="Go">
    - [GORM](https://gorm.io/docs/index.html)
  </TabItem>
</Tabs>

## Command line tools

### MySQL

You can use the `mysql` command line tool to connect to the GreptimeDB.
Please refer to the [MySQL protocol](/user-guide/protocols/mysql.md) document for connection information.

After you connect to the server, you can use all [GreptimeDB SQL commands](/reference/sql/overview.md) to interact with the database.

### PostgreSQL

You can use the `psql` command line tool to connect to the GreptimeDB.
Please refer to the [PostgreSQL protocol](/user-guide/protocols/postgresql.md) document for connection information.

After you connect to the server, you can use all [GreptimeDB SQL commands](/reference/sql/overview.md) to interact with the database.

## GreptimeDB Dashboard

You can run SQL and visualize data in the [GreptimeDB Dashboard](/getting-started/installation/greptimedb-dashboard.md).

## GUI tools

### DBeaver

Please refer to the [DBeaver Integration Guide](/user-guide/integrations/dbeaver.md).

<!-- TODO: Add GUI tools: DBeaver, etc. -->

## HTTP API

You can POST SQL queries to the GreptimeDB HTTP API to query data.
Please refer to the [HTTP API](/user-guide/protocols/http.md) document for more information.
