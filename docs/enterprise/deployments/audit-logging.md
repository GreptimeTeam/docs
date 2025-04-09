---
keywords: [audit logging, configuration, monitoring, compliance, user activity]
description: Guide to configuring audit logging in GreptimeDB Enterprise, including examples and configuration options to monitor and record database activities.
---

# Audit Logging

Database audit logging is the process of recording the actions performed on the database. The audit logs help monitor
user activities, detect suspicious actions, and ensure compliance with regulations inside or outside of an organization.
This document provides an overview of audit logging in GreptimeDB and how to configure it.

## Overview

A statement (SQL or PromQL) that is executed on GreptimeDB is recorded in the audit log (if it is configured to be
audited, of course). This is an example record in the audit log:

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

As you can see, the record is formatted as a JSON string. It contains the following fields:

- `time`: The time when the statement was executed. It's formatted as an ISO 8601 date and time string with UTC timezone.
- `user`: The user who sends the request.
- `source`: The protocol used to connect to GreptimeDB.
- `class`: The class of the statement, like "Read", "Write" or "DDL" etc.
- `command`: The command of the statement, like "Select", "Insert" or "Create" etc.
- `object_type`: The type of the object that the statement operates on, like "Database", "Table" or "Flow" etc.
- `object_names`: The names of the objects that the statement operates on.
- `statement`: The statement itself.

## Configuration

Audit logging is provided as a plugin in GreptimeDB. To enable and configure it, add the following TOML to your
GreptimeDB config file:

```toml
[[plugins]]
# Add the audit log plugin to your GreptimeDB.
[plugins.audit_log]
# Whether to enable audit logging, defaults to true.
enable = true
# The directory to store the audit log files. Defaults to "./greptimedb_data/logs".
dir = "./greptimedb_data/logs/"
# The allowed auditing sources. This option works as a filter:
# if a statement is not coming from one of these configured sources, it won't be recorded in the audit logs.
# Multiple sources are separated by comma(",").
# All sources are: "Http", "Mysql" and "Postgres".
# A special "all" (which is the default value) means all the sources.
sources = "all"
# The allowed auditing classes. This option works as a filter:
# if a statement's class do not match one of these configured values, it won't be recorded in the audit logs.
# Multiple classes are separated by comma(",").
# All classes are: "Read", "Write", "Admin", "DDL" and "Misc".
# A special "all" means all the classes.
# Defaults to "DDL" and "Admin".
classes = "ddl,admin"
# The allowed auditing commands. This option works as a filter:
# if a statement's command do not match one of these configured values, they won't be recorded in the audit logs.
# Multiple commands are separated by comma(",").
# All commands are: "Promql", "Select", "Copy", "Insert", "Delete", "Create", "Alter", "Truncate", "Drop", "Admin" and "Misc".
# A special "all" (which is the default value) means all the commands.
commands = "all"
# The allowed auditing object types. This option works as a filter:
# if a statement's target object do not match one of these configured values, they won't be recorded in the audit logs.
# Multiple object types are separated by comma(",").
# All object types are: "Database", "Table", "View", "Flow", "Index", and "Misc".
# A special "all" (which is the default value) means all the object types.
object_types = "all"
# The max retained audit log files. Defaults to 30.
# A audit log is rotated daily.
max_log_files = 30
```

## Caveats

Audit logs can be huge if not properly configured. For example, in a busy loaded GreptimeDB, setting "`all`" to all the
`sources`, `classes`, `commands` and `object_types` will record all the statements executed on GreptimeDB, resulting in
a very large audit log file. That could easily explode the disk space. So, it's highly recommended to configure the
audit log plugin properly to avoid such a situation.
