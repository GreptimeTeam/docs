---
keywords: [SQL 测试, sqlness, golden file, 单机, 分布式]
description: 为用户可见的查询行为添加并运行 sqlness 回归测试。
---

# Sqlness 测试

## 介绍

Sqlness 是 GreptimeDB 用于验证 SQL 和查询行为的 golden-file 测试框架。它会构建并启动指定的 GreptimeDB 环境，执行测试文件，再将输出与仓库中的预期结果比较。测试框架及当前参数参见 [`tests/README.md`](https://github.com/GreptimeTeam/greptimedb/blob/main/tests/README.md)。

## Sqlness 手册

### 测试文件

每个 case 包含两类文件：

- `.sql` 保存测试语句和 sqlness directive。
- `.result` 保存预期语句和输出。

先修改 `.sql` 输入，再运行 sqlness 并审查生成的 `.result` diff。结果变化可能是预期的新行为，也可能是回归，测试框架无法替你判断。只有逐项确认变更的数据行和错误信息后，才能提交 `.result` 改动。

### 组织测试案例

测试位于 `tests/cases/`。第一层目录选择运行环境，例如 `standalone/`；后续目录用于组织相关 case。Sqlness 会递归发现测试文件。

回归测试应放在能够观察到该行为的环境中。分布式规划、路由和多节点元数据行为需要分布式 case，即使同一查询在单机模式下也能成功。

## 运行测试

仓库为测试框架定义了 cargo alias：

```shell
cargo sqlness bare
```

该命令会构建 GreptimeDB、启动测试环境、执行 case，并更新或比较 `.result` 文件。需要同时检查命令结果和 `git diff`。

### 运行特定测试

```shell
cargo sqlness bare -t 'standalone:your_case'
```

`-t`/`--test-filter` 接收正则表达式，并匹配 `env:case` 格式的 case 名称。开发时可以使用窄过滤器，提交前仍应运行受影响环境或完整测试套件。
