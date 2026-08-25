---
keywords: [旧流处理模式, Arrangement, 状态, 差分更新, watermark]
description: 介绍 Flownode 旧 streaming 路径使用的内存 Arrangement 状态。
---

# Arrangement

`Arrangement` 是 Flownode 旧 streaming 路径使用的内存状态索引，实现在 `src/flow/src/utils.rs` 中；batching 模式不使用它。

Arrangement 以 `((key row, value row), timestamp, diff)` 保存更新。`timestamp` 按 dataflow 时间排列变更，差分值 `diff` 用于添加或删除 value。`get(now: Timestamp, key: &Row)` 返回指定时间对该 key 可见的 value。

Low watermark 表示仍可能需要保留历史状态的最早时间。早于该 watermark 的状态被视为已经写入 sink，可以进行压缩。过早推进 watermark 会使后续差分更新无法正确合并。

在当前实现中，`diff` 为 `-1` 时删除 key；以不同 value 再次插入同一个 key 时，会替换原 value。这些语义属于旧 streaming 状态模型，不能套用到 batching 模式的 sink 写入。
