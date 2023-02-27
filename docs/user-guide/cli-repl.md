# Command Line Tool: REPL

GreptimeDB comes with a simple REPL ("Read-Evaluate-Print-Loop") command line tool for reading or writing data.

Run the new cli, specify the gRPC address of the GreptimeDB server you want to connect to:

```shell
cargo run -- cli attach --grpc-addr=0.0.0.0:4001 
```

Wait for the REPL's prompt comes up:

```text
Ready for commands. (Hint: try 'help')
> 
```

You can type in the "help" command to see some useful helping messages:

```text
> help

Available commands (case insensitive):
- 'help': print this help
- 'exit' or 'quit': exit the REPL
- 'use <your database name>': switch to another database/schema context
- Other typed in text will be treated as SQL.
  You can enter new line while typing, just remember to end it with ';'.
```

This REPL application has hinting based on your history inputs. You can use "tab" key to complete your inputs when some suggestions pop up. A very useful feature powered by [RustyLine](https://crates.io/crates/rustyline).

Now go on typing in some SQLs to play with GreptimeDB! Here are some examples:

- Create and use databases, you can see the prompt is prefixed with the database you are currently using:

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
- Create table. The REPL supports multi-line input (just to remember to end your input in semicolon to make it a valid SQL):
```text
[foo] > create table t(
  x STRING, 
  ts TIMESTAMP TIME INDEX);
Affected Rows: 0
Cost 12 ms
```
- Insert some data and select them:
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
