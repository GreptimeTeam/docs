# Arrangement

Arrangement 存储数据流进程中的状态。更新流被发送到 Arrangement，Arrangement 会存储这些更新流，以便进一步查询和更新。

Arrangement 主要存储带有时间戳的键值对，以标记其更改时间。

在内部，Arrangement 接收的元组包括
`((Key Row, Value Row), timestamp, diff)` 这样的元组并将其存储在内存中。人们可以使用 `get(now: Timestamp, key: Row)` 方法查询某个时间的键值对，并检索指定时间 `now` 的给定键值。
该安排还假定，所有早于一定时间（也称为 Low Watermark）的内容都已被摄取，因此不会为它们保留历史记录。

注意：Arrangement 允许通过将传入元组中的 `diff` 设置为 -1 来删除键。此外，如果之前已向 Arrangement 添加了一行，而插入的相同键值不同，则会用新值覆盖原值。