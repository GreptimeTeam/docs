# Command Line Tool: REPL

GreptimeDB has a simple REPL ("Read-Evaluate-Print-Loop") command line tool for reading or writing data.

When running the new cli, you can specify the gRPC address of the GreptimeDB server you want to connect to:

```shell
./greptime cli attach --grpc-addr=0.0.0.0:4001
```

Wait for the REPL's prompt to come up:

```txt
Ready for commands. (Hint: try 'help')
> 
```

You can type in the "help" command to see some useful tips:

```txt
> help

Available commands (case insensitive):
- 'help': print this help
- 'exit' or 'quit': exit the REPL
- 'use <your database name>': switch to another database/schema context
- Other typed-in texts will be treated as SQL statements.
  You can enter new lines while typing; remember to end it with ';'.
```

REPL provides "hints" based on your historical inputs. You can use the "tab" key to complete your inputs when some suggestions pop up — a handy feature powered by [RustyLine](https://crates.io/crates/rustyline).

To quickly familiarize yourself with GreptimeDB, try below examples:

- To create or use a database (note: the database name is the current one in-use):

```txt
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
- To create a table. REPL supports multi-line input (remember to end your input with a semicolon to make it a valid SQL statement):
```txt
[foo] > create table t(
  x STRING, 
  ts TIMESTAMP TIME INDEX);
Affected Rows: 0
Cost 12 ms
```
- To insert or select data:
```txt
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