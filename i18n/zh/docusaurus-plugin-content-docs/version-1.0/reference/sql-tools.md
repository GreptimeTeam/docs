---
keywords: [SQL 工具, 查询库, 编程语言 Driver, 数据库连接, Raw SQL, 命令行工具, GUI 工具, HTTP API]
description: 介绍如何使用 SQL 工具与 GreptimeDB 交互，包括推荐的查询库、安装方法、连接数据库、使用 Raw SQL 查询数据等内容。
---

# SQL 工具

GreptimeDB 使用 SQL 作为主要查询语言，并支持许多流行的 SQL 工具。
本文档指导你如何使用 SQL 工具与 GreptimeDB 交互。

## 编程语言 Driver

推荐使用成熟的 SQL driver 来查询数据。

### 推荐的查询库

<Tabs groupId="programming-langs">
  <TabItem value="Java" label="Java">
    Java 数据库连接（JDBC）是 JavaSoft 规范的标准应用程序编程接口（API），它允许 Java 程序访问数据库管理系统。

    许多数据库协议，如 MySQL 或 PostgreSQL，都已经基于 JDBC API 实现了自己的驱动程序。
    由于 GreptimeDB [支持多种协议](/user-guide/protocols/overview.md)，这里我们使用 MySQL 协议作为示例来演示如何使用 JDBC。
    如果你希望使用其他协议，只需要将 MySQL driver 换为相应的 driver。
  </TabItem>
  <TabItem value="Go" label="Go">
    推荐使用 [GORM](https://gorm.io/) 库来查询数据。
  </TabItem>
</Tabs>

### 安装

<Tabs groupId="programming-langs">
  <TabItem value="Java" label="Java">
    如果你使用的是 [Maven](https://maven.apache.org/)，请将以下内容添加到 `pom.xml` 的依赖项列表中：

    ```xml
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.33</version>
    </dependency>
    ```
  </TabItem>

  <TabItem value="Go" label="Go">
    使用下方的命令安装 GORM：

    ```shell
    go get -u gorm.io/gorm
    ```

    以 MySQL 为例安装 driver：

    ```shell
    go get -u gorm.io/driver/mysql
    ```

    将库引入到代码中：

    ```go
    import (
        "gorm.io/gorm"
        "gorm.io/driver/mysql"
    )
    ```
  </TabItem>
</Tabs>

### Connect to database

下面以 MySQL 为例演示如何连接到 GreptimeDB。

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

    你需要一个 properties 文件来存储数据库连接信息，将其放在 Resources 目录中并命名为 `db-connection.properties`。文件内容如下：

    ```txt
    # DataSource
    db.database-driver=com.mysql.cj.jdbc.Driver
    db.url=jdbc:mysql://localhost:4002/public
    db.username=
    db.password=
    ```

    或者你可以从 [这里](https://github.com/GreptimeTeam/greptimedb-ingester-java/blob/main/ingester-example/src/main/resources/db-connection.properties) 获取文件。
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

#### 时区

<Tabs groupId="programming-langs">
  <TabItem value="Java" label="Java">
    通过设置 URL 参数来设置 JDBC 时区：

    ```txt
    jdbc:mysql://127.0.0.1:4002?connectionTimeZone=Asia/Shanghai&forceConnectionTimeZoneToSession=true
    ```
    * `connectionTimeZone={LOCAL|SERVER|user-defined-time-zone}` 配置连接时区。
    * `forceConnectionTimeZoneToSession=true` 使 session `time_zone` 变量被设置为 `connectionTimeZone` 指定的值。
  </TabItem>
  <TabItem value="Go" label="Go">
    在 DSN 中设置时区。例如，将时区设置为 `Asia/Shanghai`:

    ```go
    dsn := fmt.Sprintf("tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local&time_zone=%27Asia%2FShanghai%27",
        m.Host, m.Port, m.Database)
    ```

    更多信息请参考 [MySQL Driver 文档](https://github.com/go-sql-driver/mysql?tab=readme-ov-file#system-variables)。
  </TabItem>
</Tabs>

### Raw SQL

推荐使用 Raw SQL 来体验 GreptimeDB 的全部功能。
下面的例子展示了如何使用 Raw SQL 查询数据：

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

    请参考 [此处](https://github.com/GreptimeTeam/greptimedb-ingester-java/blob/main/ingester-example/src/main/java/io/greptime/QueryJDBC.java) 获取直接可执行的代码。
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
    
    如果你正在使用 [高层级 API](/user-guide/ingest-data/for-iot/grpc-sdks/go.md#高层级-api) 来插入数据，你可以在模型中同时声明 GORM 和 GreptimeDB Tag。
    
    ```go
    type CpuMetric struct {
        Host        string    `gorm:"column:host;primaryKey" greptime:"tag;column:host;type:string"`
        Ts          time.Time `gorm:"column:ts;primaryKey"   greptime:"timestamp;column:ts;type:timestamp;precision:millisecond"`
        CpuUser     float64   `gorm:"column:cpu_user"        greptime:"field;column:cpu_user;type:float64"`
        CpuSys      float64   `gorm:"column:cpu_sys"         greptime:"field;column:cpu_sys;type:float64"`
    }
    ```
    
    声明表名：
    
    ```go
    func (CpuMetric) TableName() string {
      return "cpu_metric"
    }
    ```
    
    使用 Raw SQL 查询数据：
    
    ```go
    var cpuMetric CpuMetric
    db.Raw("SELECT * FROM cpu_metric LIMIT 10").Scan(&result)
    ```
  </TabItem>
</Tabs>

### 查询库参考

有关如何使用查询库的更多信息，请参考相应库的文档：

<Tabs groupId="programming-langs">
  <TabItem value="Java" label="Java">
    - [JDBC 在线教程](https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html)
  </TabItem>
  <TabItem value="Go" label="Go">
    - [GORM](https://gorm.io/docs/index.html)
  </TabItem>
</Tabs>

## 命令行工具

### MySQL

你可以使用 `mysql` 命令行工具连接到 GreptimeDB。
请参考 [MySQL 协议](/user-guide/protocols/mysql.md) 文档获取连接信息。

连接到服务器后，你可以使用所有 [GreptimeDB SQL 命令](/reference/sql/overview.md)与数据库交互。

### PostgreSQL

你可以使用 `psql` 命令行工具连接到 GreptimeDB。
请参考 [PostgreSQL 协议](/user-guide/protocols/postgresql.md) 文档获取连接信息。

连接到服务器后，你可以使用所有 [GreptimeDB SQL 命令](/reference/sql/overview.md)与数据库交互。

## GreptimeDB 控制台

你可以在 [Greptime 控制台](/getting-started/installation/greptimedb-dashboard.md)中运行 SQL 并可视化数据。

## GUI 工具

### DBeaver

请参考 [DBeaver 集成指南](/user-guide/integrations/dbeaver.md)。

<!-- TODO: GUI tools: Add Navicat, DBeaver, etc. -->

## HTTP API

你可以将 POST SQL 到 GreptimeDB HTTP API 以查询数据。
请参考 [HTTP API](/user-guide/protocols/http.md) 文档获取更多信息。

