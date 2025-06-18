GreptimeDB offers ingester libraries for high-throughput data writing.
It utilizes the gRPC protocol,
which supports schemaless writing and eliminates the need to create tables before writing data.
For more information, refer to [Automatic Schema Generation](/user-guide/ingest-data/overview.md#automatic-schema-generation).

<InjectContent id="ingester-lib-introduction" content={props.children}/>

<InjectContent id="quick-start-demos" content={props.children}/>

<InjectContent id="ingester-lib-installation" content={props.children}/>

If you have set the [`--user-provider` configuration](/user-guide/deployments-administration/authentication/overview.md) when starting GreptimeDB,
you will need to provide a username and password to connect to GreptimeDB.
The following example shows how to set the username and password when using the library to connect to GreptimeDB.

<InjectContent id="ingester-lib-connect" content={props.children}/>

Each row item in a table consists of three types of columns: `Tag`, `Timestamp`, and `Field`. For more information, see [Data Model](/user-guide/concepts/data-model.md).
The types of column values could be `String`, `Float`, `Int`, `Timestamp`, `JSON` etc. For more information, see [Data Types](/reference/sql/data-types.md).

Although the time series table is created automatically when writing data to GreptimeDB via the SDK,
you can still configure table options.
The SDK supports the following table options:

- `auto_create_table`: Default is `True`. If set to `False`, it indicates that the table already exists and does not need automatic creation, which can improve write performance.
- `ttl`, `append_mode`, `merge_mode`: For more details, refer to the [table options](/reference/sql/create.md#table-options).

<InjectContent id="set-table-options" content={props.children}/>

For how to write data to GreptimeDB, see the following sections.

The GreptimeDB low-level API provides a straightforward method to write data to GreptimeDB 
by adding rows to the table object with a predefined schema.

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

The following example shows how to insert rows to tables in GreptimeDB.

<InjectContent id="insert-rows" content={props.children}/>

Streaming insert is useful when you want to insert a large amount of data such as importing historical data.

<InjectContent id="streaming-insert" content={props.children}/>

<InjectContent id="update-rows" content={props.children}/>

The high-level API uses an ORM style object to write data to GreptimeDB.
It allows you to create, insert, and update data in a more object-oriented way,
providing developers with a friendlier experience.
However, it is not as efficient as the low-level API.
This is because the ORM style object may consume more resources and time when converting the objects.

<InjectContent id="high-level-style-object" content={props.children}/>

<InjectContent id="high-level-style-insert-data" content={props.children}/>

Streaming insert is useful when you want to insert a large amount of data such as importing historical data.

<InjectContent id="high-level-style-streaming-insert" content={props.children}/>

<InjectContent id="high-level-style-update-data" content={props.children}/>

GreptimeDB supports storing complex data structures using [JSON type data](/reference/sql/data-types.md#json-type).
With this ingester library, you can insert JSON data using string values.
For instance, if you have a table named `sensor_readings` and wish to add a JSON column named `attributes`,
refer to the following code snippet.

<InjectContent id="ingester-json-type" content={props.children}/>

<InjectContent id="ingester-lib-debug-logs" content={props.children}/>

<InjectContent id="ingester-lib-reference" content={props.children}/>

<InjectContent id="faq" content={props.children}/>
