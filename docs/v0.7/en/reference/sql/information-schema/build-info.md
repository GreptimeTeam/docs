# BUILD_INFO

The `BUILD_INFO` table provides the system build info:

```sql
USE INFORMATION_SCHEMA;

SELECT * FROM BUILD_INFO;
```

The output is as follows:

```sql
+------------+------------------------------------------+------------------+-----------+-------------+
| git_branch | git_commit                               | git_commit_short | git_dirty | pkg_version |
+------------+------------------------------------------+------------------+-----------+-------------+
| main       | 92a8e863ded618fe1be93f799360015b4f8f28b6 | 92a8e86          | true      | 0.7.1       |
+------------+------------------------------------------+------------------+-----------+-------------+
```

The columns in the output:

* `branch`: the build git branch name.
* `git_commit`: the build commit revision.
* `git_commit_short`: the short commit revision.
* `git_dirty`:  `true` if the build source directory contains uncommitted changes.
* `pkg_version`: the GreptimeDB version.

