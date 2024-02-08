
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

### Data model

Each row item in a table consists of three types of columns: `Tag`, `Timestamp`, and `Field`. For more information, see [Data Model](/user-guide/concepts/data-model.md).
The types of column values could be `String`, `Float`, `Int`, `Timestamp`, etc. For more information, see [Data Types](/reference/sql/data-types.md).

### GreptimeDB style object

The GreptimeDB style object allows you to add rows to the table object with a predefined schema.

The following code first creates a table with columns `host`, `ts`, `cpu_user`,
and `cpu_sys`. Then, it adds a row to the table.
A row contains columns for `Tag`, `Timestamp`,
and `Field`. The `Tag` column is of type `String`,
the `Timestamp` column is of type `Timestamp`,
and the `Field` column is of type `Float`.

{template greptimedb-style-object%%}

To improve the efficiency of writing data, you can create multiple rows at once to write to GreptimeDB.

{template create-rows%%}

#### Insert data

The following example shows how to insert rows to tables in GreptimeDB.

{template insert-rows%%}

#### Streaming insert

Streaming insert is useful when you want to insert a large amount of data such as importing historical data.

{template streaming-insert%%}

#### Update data

Please refer to [update data](/user-guide/write-data/overview.md#update-data) for the updating mechanism.
In the following code, we first save a row and then use the same tag and time index to identify the row for updating.

{template update-rows%%}

<!-- TODO ### Delete Metrics -->

### ORM style object

The ORM style object allows you to create, insert, and update data in a more object-oriented way.

{template orm-style-object%%}

#### Insert data

{template orm-style-insert-data%%}

#### Streaming insert

Streaming insert is useful when you want to insert a large amount of data such as importing historical data.

{template orm-style-streaming-insert%%}

#### Update data

Please refer to [update data](/user-guide/write-data/overview.md#update-data) for the updating mechanism.
In the following code, we first save a row and then use the same tag and time index to identify the row for updating.

{template orm-style-update-data%%}

### More examples

{template more-ingestion-examples%%}

{template ingester-lib-debug-logs%%}

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
