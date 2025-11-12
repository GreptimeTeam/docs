---
keywords: [Sqlness 测试, SQL, 测试套件, 测试文件, 测试案例]
description: 介绍 GreptimeDB 的 Sqlness 测试，包括测试文件类型、组织测试案例和运行测试的方法。
---

# Sqlness 测试

## 介绍

SQL 是 `GreptimeDB` 的一个重要用户接口。我们为它提供了一个单独的测试套件（名为 `sqlness`）。

## Sqlness 手册

### 测试文件

Sqlness 有三种类型的文件

- `.sql`：测试输入，仅包含 SQL
- `.result`：预期的测试输出，包含 SQL 和其结果
- `.output`：不同的输出，包含 SQL 和其结果

`.result` 和 `.output` 都是输出（执行结果）文件。区别在于 `.result` 是标准（预期）输出，而 `.output` 是错误输出。因此，如果生成了 `.output` 文件，意味着测试结果不同，测试失败。你应该检查变更日志来解决问题。

你只需要在 `.sql` 文件中编写测试 SQL，然后运行测试。第一次运行时会生成 `.output` 文件，因为没有 `.result` 文件进行比较。如果你确认 `.output` 文件中的内容是正确的，可以将其重命名为 `.result`，这意味着它是预期输出。

任何时候都应该只有两种文件类型，`.sql` 和 `.result` —— 否则，存在 `.output` 文件意味着测试失败。这就是为什么我们不应该在 `.gitignore` 中忽略 `.output` 文件类型，而是跟踪它并确保它不存在。

### 组织测试案例

输入案例的根目录是 `tests/cases`。它包含几个子目录，代表不同的测试模式。例如，`standalone/` 包含所有在 `greptimedb standalone start` 模式下运行的测试。

在第一级子目录下（例如 `cases/standalone`），你可以随意组织你的测试案例。Sqlness 会递归地遍历每个文件并运行它们。

## 运行测试

与其他测试不同，这个测试工具是以二进制目标形式存在的。你可以用以下命令运行它

```shell
cargo run --bin sqlness-runner bare
```

它会自动完成以下步骤：编译 `GreptimeDB`，启动它，抓取测试并将其发送到服务器，然后收集和比较结果。你只需要检查是否有新的 `.output` 文件。如果没有，恭喜你，测试通过了 🥳！

### 运行特定测试

```shell
cargo sqlness bare -t your_test
```

如果你指定了第二个参数，则只会执行名称中包含指定字符串的测试案例。Sqlness 还支持基于环境的过滤。过滤器接受正则表达式字符串，并会检查格式为 `env:case` 的案例名称。
