# Migrate from MySQL

This document will guide you through the migration process from MySQL to GreptimeDB.

## Before you start the migration

Please be aware that though GreptimeDB supports the wire protocol of MySQL, it does not mean GreptimeDB implements all
MySQL's features. You may refer to the "[ANSI Compatibility](../../reference/sql/compatibility.md)" to see the
constraints regarding using SQL in GreptimeDB.

## Migration steps

### Step 1: Create the databases and tables in GreptimeDB.

GreptimeDB has its own SQL syntax for creating tables. We cannot simply reuse the table creation SQLs that are produced
by MySQL. So first please refer to our document for "[CREATE](../../reference/sql/create.md)ing" the corresponding
databases and tables in GreptimeDB.

### Step 2: Write data to both GreptimeDB and MySQL simultaneously.

Writing data to both GreptimeDB and MySQL simultaneously is a practical strategy to avoid data loss during migration. By
utilizing MySQL's client libraries (JDBC + some MySQL driver), you can set up two client instances - one for GreptimeDB
and another for MySQL. For guidance on writing data to GreptimeDB using SQL, please refer to the "Ingest Data" section.

If retaining all historical data isn't necessary, you can simultaneously write data to both GreptimeDB and MySQL for a
specific period to accumulate the required recent data. Subsequently, cease writing to MySQL and continue exclusively
with GreptimeDB. If a complete migration of all historical data is needed, please proceed with the following steps.

### Step 3: Export data from MySQL

[mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html) is a commonly used tool to export data from MySQL.
Using it, we can export the data that can be later imported into GreptimeDB directly. For example, if we want to export
two databases, `db1` and `db2` from MySQL, we can use the following command:

```bash
mysqldump -h127.0.0.1 -P3306 -umysql_user -p --compact -cnt --skip-extended-insert --databases db1 db2 > /path/to/output.sql
```

Replace the `-h`, `-P` and `-u` flags with the appropriate values for your MySQL server. The `--databases` flag is used
to specify the databases to be exported. The output will be written to the `/path/to/output.sql` file.

The content in the `/path/to/output.sql` file should be like this:

```plaintext
~ ❯ cat /path/to/output.sql

USE `db1`;
INSERT INTO `foo` (`ts`, `a`, `b`) VALUES (1,'hello',1);
INSERT INTO ...

USE `db2`;
INSERT INTO `foo` (`ts`, `a`, `b`) VALUES (2,'greptime',2);
INSERT INTO ...
```

### Step 4: Import data into GreptimeDB

The [MySQL Command-Line Client](https://dev.mysql.com/doc/refman/8.4/en/mysql.html) can be used to import data into
GreptimeDB. Continuing the above example, say the data is exported to file `/path/to/output.sql`, then we can use the
following command to import the data into GreptimeDB:

```bash
mysql -h127.0.0.1 -P4002 -ugreptime_user -p -e "source /path/to/output.sql"
```

Replace the `-h`, `-P` and `-u` flags with the appropriate values for your GreptimeDB server. The `source` command is
used to execute the SQL commands in the `/path/to/output.sql` file. Add `-vvv` to see the detailed execution results for
debugging purpose.

To summarize, data migration steps can be illustrate as follows:

![migrate mysql data steps](/migration-mysql.jpg)

After the data migration is completed, you can stop writing data to MySQL and continue using GreptimeDB exclusively!
