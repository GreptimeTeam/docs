---
keywords: [arrangement component, state storage, update streams, key-value pairs, querying and updating]
description: Details on the arrangement component in Flownode, which stores state and update streams for querying and updating.
---

# Arrangement

Arrangement stores the state in the dataflow's process. It stores the streams of update flows for further querying and updating.

The arrangement essentially stores key-value pairs with timestamps to mark their change time.

Internally, the arrangement receives tuples like
`((Key Row, Value Row), timestamp, diff)` and stores them in memory. One can query key-value pairs at a certain time using the `get(now: Timestamp, key: Row)` method.
The arrangement also assumes that everything older than a certain time (also known as the low watermark) has already been ingested to the sink tables and does not keep a history for them.

:::tip NOTE

The arrangement allows for the removal of keys by setting the `diff` to -1 in incoming tuples. Moreover, if a row has been previously added to the arrangement and the same key is inserted with a different value, the original value is overwritten with the new value.

:::
