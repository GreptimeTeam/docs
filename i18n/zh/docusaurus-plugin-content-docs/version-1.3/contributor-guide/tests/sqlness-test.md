---
keywords: [Sqlness 测试, SQL, 测试套件, 测试文件, 测试案例]
description: 介绍 GreptimeDB 的 Sqlness 测试，包括测试文件类型、组织测试案例和运行测试的方法。
---

# Sqlness 测试

## 介绍

Sqlness 是 GreptimeDB 针对 SQL 和协议行为的端到端回归测试。每个 case 向运行中的 GreptimeDB 发送语句，并将输出与仓库中的结果文件比较。

## Sqlness 手册

### 测试文件

每个 case 使用两类文件：

- `.sql`：测试输入，仅包含 SQL
- `.result`：预期的测试输出，包含 SQL 和其结果

在 `.sql` 文件中编写输入，运行测试后生成或更新 `.result`。必须检查每一处结果差异，只有行为变化符合预期时才能接受。

### 组织测试案例

输入 case 位于 `tests/cases`。第一级目录选择运行环境，例如 `standalone/` 表示使用单机 GreptimeDB。

在环境目录内，新 case 应与它覆盖的功能放在一起。Sqlness 会递归发现 case 文件。

## 运行测试

运行命令如下：

```shell
cargo sqlness bare
```

该命令会构建并启动 GreptimeDB、执行选中的 case，再比较输出。`.result` 发生变化只是待审查的结果，不代表新输出一定正确。

### 运行特定测试

```shell
cargo sqlness bare -t your_test
```

`-t` 或 `--test-filter` 选项接受正则表达式字符串。Sqlness 会检查格式为 `env:case` 的案例名称。
