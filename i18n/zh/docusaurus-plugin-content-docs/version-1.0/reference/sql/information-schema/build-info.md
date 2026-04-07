---
keywords: [BUILD_INFO 表, 构建信息, 版本信息, SQL查询, 数据库构建]
description: 提供了 GreptimeDB 构建信息的相关内容，包括版本信息、构建时间和相关的 SQL 查询示例。
---

# BUILD_INFO

`BUILD_INFO` 表提供了系统的构建信息：

```sql
USE INFORMATION_SCHEMA;

SELECT * FROM BUILD_INFO;
```

结果如下：

```sql
+------------+------------------------------------------+------------------+-----------+-------------+
| git_branch | git_commit                               | git_commit_short | git_clean | pkg_version |
+------------+------------------------------------------+------------------+-----------+-------------+
|            | c595a56ac89bef78b19a76aa60d8c6bcac7354a5 | c595a56a         | true      | 0.9.0       |
+------------+------------------------------------------+------------------+-----------+-------------+
```

结果中的列：

* `branch`：构建的 git 分支名称。
* `git_commit`：提交构建的 `commit`。
* `git_commit_short`：提交构建的 `commit` 缩写。
* `git_clean`：如果构建源目录包含了所有提交的更改，则为 `true`。
* `pkg_version`：GreptimeDB 版本。
