# Arrangement

Arrangement store the state in the dataflow's process, for now there is no persisent and we store arrangement in the memory. The arrangement essentially store key-value pairs with timestamp to mark it's change time. 

The kv pairs are both `Row` in arrangement, and the timestamp is the time when the row is created or updated.

internally, arrangement get tuples like
`((Key Row, Value Row), timestamp, diff)` and store them in the memory. And one can query key-value pairs at certain time with `get(now: Timestamp, key: Row)` method, and get the value at given time `now` for the key. Arrangement, also assume everything older than a certain time(also known as lwoe watermark) is already ingested and wouldn't keep history for them.