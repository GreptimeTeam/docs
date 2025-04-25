---
keywords: [build information, SQL information schema, version details, build metadata, system build info]
description: Contains build information for the SQL information schema, including version details, build date, and other relevant metadata.
---

# BUILD_INFO

The `BUILD_INFO` table provides the system build info:

```sql
USE INFORMATION_SCHEMA;

SELECT * FROM BUILD_INFO;
```

The output is as follows:

```sql
+------------+------------------------------------------+------------------+-----------+-------------+
| git_branch | git_commit                               | git_commit_short | git_clean | pkg_version |
+------------+------------------------------------------+------------------+-----------+-------------+
|            | c595a56ac89bef78b19a76aa60d8c6bcac7354a5 | c595a56a         | true      | 0.9.0       |
+------------+------------------------------------------+------------------+-----------+-------------+
```

The columns in the output:

* `branch`: the build git branch name.
* `git_commit`: the build commit revision.
* `git_commit_short`: the short commit revision.
* `git_clean`:  `true` if the build source directory contains all the committed changes.
* `pkg_version`: the GreptimeDB version.

