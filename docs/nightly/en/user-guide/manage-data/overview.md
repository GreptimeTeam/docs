## Update data

Updates can be effectively performed by insertions.
If the tags and time index have identical column values, the old data will be replaced with the new one.
Tags with a time index in GreptimeDB are similar to series in other TSDBs.

:::tip NOTE
The performance of updates is the same as insertion, but excessive updates may negatively impact query performance.
:::

For more information about column types, please refer to [Data Model](../concepts/data-model.md).

## Delete data

You can effectively delete data by specifying tags and time index.
Deleting data without specifying the tag and time index columns is not efficient, as it requires two steps: querying the data and then deleting it by tag and time index.

:::tip NOTE
Excessive deletions can negatively impact query performance.
:::

For more information about column types, please refer to [Data Model](../concepts/data-model.md).