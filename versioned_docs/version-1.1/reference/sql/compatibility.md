---
keywords: [ANSI SQL, SQL compatibility, SQL extensions, table creation, data insertion]
description: Describes the subset of ANSI SQL supported by GreptimeDB and its unique extensions, including major incompatibilities and extensions for table creation, data insertion, updates, queries, and deletions.
---

# ANSI Compatibility

GreptimeDB supports a subset of ANSI SQL and has some unique extensions. Some major incompatibilities and extensions are described below:

1. Create a table:
   * Supports the unique `TIME INDEX` constraint. Please refer to the [Data Model](/user-guide/concepts/data-model.md) and the [CREATE](./create.md) table creation syntax for details.
   * Currently only supports `PRIMARY KEY` constraints and does not support other types of constraints or foreign keys.
   * GreptimeDB is a native distributed database, so the table creation syntax for distributed tables supports partitioning rules. Please also refer to the [CREATE](./create.md).
2. Insert data: Consistent with ANSI SQL syntax, but requires the `TIME INDEX` column value (or default value) to be provided.
3. Update data: Does not support `UPDATE` syntax, but if the primary key and `TIME INDEX` corresponding column values are the same during `INSERT`, subsequent inserted rows will overwrite previously written rows, effectively achieving an update.
   * Since 0.8, GreptimeDB supports [append mode](/reference/sql/create.md#create-an-append-only-table) that creates an append-only table with `append_mode="true"` option which keeps duplicate rows.
   * GreptimeDB supports [merge mode](/reference/sql/create.md#create-an-append-only-table) that creates a table with `merge_mode="last_non_null"` option which allow updating a field partially.
4. Query data: Query syntax is compatible with ANSI SQL, with some functional differences and omissions.
   * Since v0.9.0, begins to support [VIEW](/user-guide/query-data/view.md).
   * TQL syntax extension: Supports executing PromQL in SQL via TQL subcommands. Please refer to the [TQL](./tql.md) section for details.
   * [Range Query](/reference/sql/range.md#range-query) to query and aggregate data within a range of time.
5. Delete data: Deletion syntax is basically consistent with ANSI SQL.
6. Others:
   * Identifiers such as table names and column names have constraints similar to ANSI SQL, are case sensitive, and require double quotes when encountering special characters or uppercase letters.
   * GreptimeDB has optimized identifier rules for different dialects. For example, when you connect with a MySQL or PostgreSQL client, you can use identifier rules specific to that SQL dialect, such as using backticks `` ` `` for MySQL and standard double quotes `"` for PostgreSQL.
