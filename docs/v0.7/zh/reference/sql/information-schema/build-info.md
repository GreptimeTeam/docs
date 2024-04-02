# BUILD_INFO

`BUILD_INFO` 表提供了系统的构建信息：

```sql
USE INFORMATION_SCHEMA;

SELECT * FROM BUILD_INFO;
```

结果如下：

```sql
+------------+------------------------------------------+------------------+-----------+-------------+
| git_branch | git_commit                               | git_commit_short | git_dirty | pkg_version |
+------------+------------------------------------------+------------------+-----------+-------------+
| main       | 92a8e863ded618fe1be93f799360015b4f8f28b6 | 92a8e86          | true      | 0.7.1       |
+------------+------------------------------------------+------------------+-----------+-------------+
```

结果中的列：

* `branch`：构建的 git 分支名称。
* `git_commit`：提交构建的 `commit`。
* `git_commit_short`：提交构建的 `commit` 缩写。
* `git_dirty`：如果构建源目录包含未提交的更改，则为 `true`。
* `pkg_version`：GreptimeDB 版本。
