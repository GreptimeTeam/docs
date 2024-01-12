
GreptimeDB uses different client libraries for writing and querying data.
You can choose the client library that best suits your needs.

## Write data

GreptimeDB provides an ingester library to help you write data.
It utilizes the gRPC protocol,
which supports schemaless writing and eliminates the need to create tables before writing data.
For more information, refer to [Automatic Schema Generation](/user-guide/write-data/overview.md#automatic-schema-generation).

{template ingester-lib-introduction%%}

### Installation

{template ingester-lib-installation%%}

### Connect to database

Username and password are always required to connect to GreptimeDB.
For how to set authentication to GreptimeDB, see [Authentication](/user-guide/clients/authentication.md).
Here we set the username and password when using the library to connect to GreptimeDB.

{template ingester-lib-connect%%}

### Row object

Each row item in a table consists of three types of columns: `Tag`, `Timestamp`, and `Field`. For more information, see [Data Model](/user-guide/concepts/data-model.md).
The types of column values could be `String`, `Float`, `Int`, `Timestamp`, etc. For more information, see [Data Types](/reference/data-types.md).

{template row-object%%}

### Create rows

The following example shows how to create a row contains `Tag`, `Timestamp`, and `Field` columns. The `Tag` column is a `String` type, the `Timestamp` column is a `Timestamp` type, and the `Field` column is a `Float` type.

{template create-a-row%%}

To improve the efficiency of writing data, you can create multiple rows at once to write to GreptimeDB.

{template create-rows%%}

### Save rows

The following example shows how to save rows to tables in GreptimeDB.

{template save-rows%%}

### Update rows

Please refer to [update data](/user-guide/write-data/overview.md#update-data) for the updating mechanism.
The following example shows saving a row and then updating the row.

{template update-rows%%}

<!-- TODO ### Delete Metrics -->

{template ingester-lib-debug-logs%%}

### More examples

{template more-ingestion-examples%%}

### Ingester library reference

{template ingester-lib-reference%%}

## Query data

GreptimeDB uses SQL as the main query language and is compatible with MySQL and PostgreSQL.
Therefore, we recommend using mature SQL drivers to query data.

### Recommended library

{template recommended-query-library%%}

### Installation

{template query-library-installation%%}

### Connect to database

The following example shows how to connect to GreptimeDB:

{template query-library-connect%%}

### Raw SQL

We recommend you using raw SQL to experience the full features of GreptimeDB.
The following example shows how to use raw SQL to query data:

{template query-library-raw-sql%%}

### Query library reference

For more information about how to use the query library, please see the documentation of the corresponding library:

{template query-lib-doc-link%%}
