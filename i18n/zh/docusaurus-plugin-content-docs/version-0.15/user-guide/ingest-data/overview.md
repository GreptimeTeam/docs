---
keywords: [自动生成表结构, schema 写入, 数据写入方法, 数据管理, 数据集成]
description: 介绍 GreptimeDB 的自动生成表结构功能和推荐的数据写入方法，并提供下一步学习的链接。
---

# 写入数据

## 自动生成表结构

GreptimeDB 支持无 schema 写入，即在数据写入时自动创建表格并添加必要的列。
这种能力确保你无需事先手动定义 schema，从而更容易管理和集成各种数据源。
<!-- TODO: 添加协议和集成的链接 -->
此功能适用于所有协议和集成，除了 [SQL](./for-iot/sql.md)。

## 推荐的数据写入方法

GreptimeDB 支持针对特定场景的各种数据写入方法，以确保最佳性能和集成灵活性。

- [可观测场景](./for-observability/overview.md)：适用于实时监控和警报。
- [物联网场景](./for-iot/overview.md)：适用于实时数据和复杂的物联网基础设施。

## 下一步

- [查询数据](/user-guide/query-data/overview.md): 学习如何通过查询 GreptimeDB 数据库来探索数据。
- [管理数据](/user-guide/manage-data/overview.md): 学习如何更新和删除数据等，确保数据完整性和高效的数据管理。

