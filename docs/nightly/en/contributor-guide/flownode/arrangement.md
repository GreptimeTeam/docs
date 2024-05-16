# Arrangement

Arrangement stores the state in the dataflow's process. Streams of update flows are sent to an arrangement, and the arrangement stores them for further querying and updating.

The arrangement essentially stores key-value pairs with timestamps to mark their change time.

Internally, the arrangement receives tuples like
`((Key Row, Value Row), timestamp, diff)` and stores them in memory. One can query key-value pairs at a certain time using the `get(now: Timestamp, key: Row)` method, and retrieve the value for the given key at the specified time `now`.
The arrangement also assumes that everything older than a certain time (also known as the low watermark) has already been ingested and does not keep a history for them.