
GreptimeDB uses different client libraries for writing and querying data.
You can choose the client library that best suits your needs.

## Write data

GreptimeDB provides an ingester library to help you write data.
It utilizes the gRPC protocol,
which supports schemaless writing and eliminates the need to create tables before writing data.
For more information, refer to [Automatic Schema Generation](/user-guide/write-data/overview.md#automatic-schema-generation).

<InjectContent id="ingester-lib-introduction" content={props.children}/>

### Installation

<InjectContent id="ingester-lib-installation" content={props.children}/>

### Connect to database

Username and password are always required to connect to GreptimeDB.
For how to set authentication to GreptimeDB, see [Authentication](/user-guide/clients/authentication.md).
Here we set the username and password when using the library to connect to GreptimeDB.

<InjectContent id="ingester-lib-connect" content={props.children}/>

### Data model

Each row item in a table consists of three types of columns: `Tag`, `Timestamp`, and `Field`. For more information, see [Data Model](/user-guide/concepts/data-model.md).
The types of column values could be `String`, `Float`, `Int`, `Timestamp`, etc. For more information, see [Data Types](/reference/sql/data-types.md).

### Low-level API

The GreptimeDB low-level API provides a straightforward method to write data to GreptimeDB 
by adding rows to the table object with a predefined schema.

#### Create row objects

This following code snippet begins by constructing a table named `cpu_metric`,
which includes columns `host`, `cpu_user`, `cpu_sys`, and `ts`. 
Subsequently, it inserts a single row into the table.

The table consists of three types of columns:

- `Tag`: The `host` column, with values of type `String`.
- `Field`: The `cpu_user` and `cpu_sys` columns, with values of type `Float`.
- `Timestamp`: The `ts` column, with values of type `Timestamp`.

<InjectContent id="low-level-object" content={props.children}/>

To improve the efficiency of writing data, you can create multiple rows at once to write to GreptimeDB.

<InjectContent id="create-rows" content={props.children}/>

#### Insert data

The following example shows how to insert rows to tables in GreptimeDB.

<InjectContent id="insert-rows" content={props.children}/>

#### Streaming insert

Streaming insert is useful when you want to insert a large amount of data such as importing historical data.

<InjectContent id="streaming-insert" content={props.children}/>

<InjectContent id="update-rows" content={props.children}/>

<!-- TODO ### Delete Metrics -->

### High-level API

The high-level API uses an ORM style object to write data to GreptimeDB.
It allows you to create, insert, and update data in a more object-oriented way,
providing developers with a friendlier experience.
However, it is not as efficient as the low-level API.
This is because the ORM style object may consume more resources and time when converting the objects.

#### Create row objects

<InjectContent id="high-level-style-object" content={props.children}/>

#### Insert data

<InjectContent id="high-level-style-insert-data" content={props.children}/>

#### Streaming insert

Streaming insert is useful when you want to insert a large amount of data such as importing historical data.

<InjectContent id="high-level-style-streaming-insert" content={props.children}/>

<InjectContent id="high-level-style-update-data" content={props.children}/>

### More examples

<InjectContent id="more-ingestion-examples" content={props.children}/>

<InjectContent id="ingester-lib-debug-logs" content={props.children}/>

### Ingester library reference

<InjectContent id="ingester-lib-reference" content={props.children}/>

## Query data

GreptimeDB uses SQL as the main query language and is compatible with MySQL and PostgreSQL.
Therefore, we recommend using mature SQL drivers to query data.

### Recommended library

<InjectContent id="recommended-query-library" content={props.children}/>

### Installation

<InjectContent id="query-library-installation" content={props.children}/>

### Connect to database

The following example shows how to connect to GreptimeDB:

<InjectContent id="query-library-connect" content={props.children}/>

### Raw SQL

We recommend you using raw SQL to experience the full features of GreptimeDB.
The following example shows how to use raw SQL to query data.

<InjectContent id="query-library-raw-sql" content={props.children}/>

### Query library reference

For more information about how to use the query library, please see the documentation of the corresponding library:

<InjectContent id="query-lib-doc-link" content={props.children}/>
