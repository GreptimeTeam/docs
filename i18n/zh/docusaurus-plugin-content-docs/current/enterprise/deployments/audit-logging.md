---
keywords: [审计日志, 配置方法, 监控数据库操作, 合规性, JSON 格式]
description: 介绍 GreptimeDB 中的审计日志功能，包括审计日志的格式、配置方法及注意事项，帮助用户监控数据库操作并确保合规性。
---

# 审计日志

数据库的审计日志记录了对数据库执行的操作。审计日志有助于监控用户活动，检测可疑操作，并确保组织内外的合规性。本文档提供了
GreptimeDB 中审计日志的概述以及如何配置它。

## 概述

一条在 GreptimeDB 上执行的语句（SQL 或 PromQL）会被记录在审计日志中（当然，前提是已经将其配置为需要被审计）。以下是审计日志中的一条示例记录：

```json
{
  "time": "2024-11-05T06:13:19.903713Z",
  "user": "greptime_user",
  "source": "Mysql",
  "class": "Ddl",
  "command": "Create",
  "object_type": "Database",
  "object_names": [
    "audit_test"
  ],
  "statement": "CREATE DATABASE audit_test"
}
```

正如您所见，一条审计日志的记录被格式化为 JSON 字符串。它包含以下字段：

- `time`: 语句执行的时间。格式为带有 UTC 时区的 ISO 8601 日期和时间的字符串。
- `user`: 发送该请求的用户。
- `source`: 请求的来源，也即用于连接到 GreptimeDB 的协议。
- `class`: 语句的类别，如 "Read"、"Write" 或 "DDL" 等。
- `command`: 语句的命令，如 "Select"、"Insert" 或 "Create" 等。
- `object_type`: 语句操作的对象的类型，如 "Database"、"Table" 或 "Flow" 等。
- `object_names`: 语句操作的对象的名称。
- `statement`: 语句本身。

## 配置

审计日志作为 GreptimeDB 的插件提供。要启用并配置它，请将以下 TOML 添加到 GreptimeDB 配置文件中：

```toml
[[plugins]]
# 将审计日志插件添加到 GreptimeDB 中。
[plugins.audit_log]
# 是否启用审计日志，默认为 true。
enable = true
# 存储审计日志文件的目录。默认为 "./greptimedb_data/logs/"。
dir = "./greptimedb_data/logs/"
# 允许审计的语句的来源。此选项作为过滤器：如果语句不来自这些配置的来源之一，则不会记录在审计日志中。
# 多个来源用逗号（","）分隔。
# 所有可配置的来源是 "Http"、"Mysql" 和 "Postgres"。
# 一个特殊的 "all"（默认值）表示所有来源。
sources = "all"
# 允许审计的语句的类别。此选项作为过滤器：如果语句的类别不匹配这些配置的值之一，则不会记录在审计日志中。
# 多个类别用逗号（","）分隔。
# 所有可配置的类别是 "Read"、"Write"、"Admin"、"DDL" 和 "Misc"。
# 一个特殊的 "all" 表示所有类别。默认值为 "DDL" 和 "Admin"。
classes = "ddl,admin"
# 允许审计的语句的命令。此选项作为过滤器：如果语句的命令不匹配这些配置的值之一，则不会记录在审计日志中。
# 多个命令用逗号（","）分隔。
# 所有可配置的命令是 "Promql"、"Select"、"Copy"、"Insert"、"Delete"、"Create"、"Alter"、"Truncate"、"Drop"、"Admin" 和 "Misc"。
# 一个特殊的 "all"（默认值）表示所有命令。
commands = "all"
# 允许审计的对象类型。此选项作为过滤器：如果语句的目标对象不匹配这些配置的值之一，则不会记录在审计日志中。
# 多个对象类型用逗号（","）分隔。
# 所有可配置的对象类型是 "Database"、"Table"、"View"、"Flow"、"Index" 和 "Misc"。
# 一个特殊的 "all"（默认值）表示所有对象类型。
object_types = "all"
# 保留的审计日志文件的最大数量。默认为 30。
# 审计日志每天生成一个新的。
max_log_files = 30
```

## 注意

如果没有正确配置的话，审计日志可能会非常庞大。例如，在业务繁忙的 GreptimeDB 中，将 "`all`" 设置给所有的 `sources`，`classes`，
`commands` 和 `object_types` 会记录在 GreptimeDB 上执行的所有语句，导致一个非常大的审计日志文件。这可能会轻易地耗尽磁盘空间。因此，强烈建议合理地配置审计日志插件以避免这种情况。
