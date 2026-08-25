---
keywords: [legacy streaming mode, Arrangement, state, differential updates, watermark]
description: In-memory Arrangement state used by Flownode's legacy streaming path.
---

# Arrangement

`Arrangement` is an in-memory state index used by Flownode's legacy streaming path. It is implemented in `src/flow/src/utils.rs`; batching mode does not use it.

An Arrangement stores updates as `((key row, value row), timestamp, diff)`. The timestamp orders changes in dataflow time, and the differential `diff` adds or removes a value. `get(now: Timestamp, key: &Row)` returns the value visible for a key at the requested time.

The low watermark is the earliest time for which history may still be needed. State older than that watermark is assumed to have reached the sink and can be compacted. Advancing it too far would make later differential updates impossible to reconcile.

For the current implementation, a `diff` of `-1` removes a key. Inserting the same key with a different value replaces the previous value. These semantics are part of the legacy streaming state model and must not be applied to batching-mode sink writes.
