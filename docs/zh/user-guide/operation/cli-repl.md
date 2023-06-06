# 命令行工具：REPL

GreptimeDB 提供了一个简单的命令行工具 REPL ("Read-Evaluate-Print-Loop")，用来读取或写入数据。

当运行新的 cli 时，用户可以指定想连接的 GreptimeDB 服务器的 gRPC 地址：

```shell
cargo run -- cli attach --grpc-addr=0.0.0.0:4001 
```

等待 REPL 的提示出现：

```text
Ready for commands. (Hint: try 'help')
> 
```

用户可以输入 "help" 命令来查看一些有用的提示：

```text
> help

Available commands (case insensitive):
- 'help': print this help
- 'exit' or 'quit': exit the REPL
- 'use <your database name>': switch to another database/schema context
- Other typed-in texts will be treated as SQL statements.
  You can enter new lines while typing; remember to end it with ';'.
```

REPL 会根据用户的历史输入提供一些"提示" 。当一些提示弹出时，可以按下 "tab" 键来完成你的输入--这是一个由 [RustyLine](https://crates.io/crates/rustyline) 提供的便捷功能。

想要快速熟悉 GreptimeDB ，可以尝试以下实例：

- 创建或使用一个数据库（注意：数据库的名称应该与当前使用数据库的名称一致）：

```text
> create database foo;
Affected Rows: 1
Cost 21 ms
> show databases;
+---------+
| Schemas |
+---------+
| foo     |
| public  |
+---------+
Total Rows: 2
Cost 8 ms
> use foo;
Total Rows: 0
Cost 4 ms
Using foo
[foo] >
```
- 创建一个表。 REPL 支持多行输入（输入的内容需以分号结束，使其成为有效的 SQL 语句）：
```text
[foo] > create table t(
  x STRING, 
  ts TIMESTAMP TIME INDEX);
Affected Rows: 0
Cost 12 ms
```
- 插入或选择数据：
```text
[foo] > insert into t(x, ts) values('hello', 1);
Affected Rows: 1
Cost 5 ms
[foo] > insert into t(x, ts) values('world', 2);
Affected Rows: 1
Cost 5 ms
[foo] > select * from t;
+-------+-------------------------+
| x     | ts                      |
+-------+-------------------------+
| hello | 1970-01-01T00:00:00.001 |
| world | 1970-01-01T00:00:00.002 |
+-------+-------------------------+
Total Rows: 2
Cost 17 ms
```
