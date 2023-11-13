# Authentication

Authentication occurs when a user attempts to connect to the database. GreptimeDB offers a simple built-in mechanism for authentication, allowing users to configure either a fixed account for convenient usage or an account file for multiple user accounts. By passing in a file, GreptimeDB loads all users listed within it.

GreptimeDB reads the user and password on each line using `=` as a separator, just like a command-line config. For example:

```
alice=aaa
bob=bbb
```

then start server with `--user-provider` parameter:

```shell
# standalone mode
./greptime standalone start --user-provider=static_user_provider:file:<path_to_file>

# cluster mode, user_provider is loaded into frontend
./greptime frontend start --user-provider=static_user_provider:file:<path_to_file> [...]
```

Now, user `alice` with password `aaa` and user `bob` with password `bbb` are loaded into GreptimeDB's memory. You can create a connection to GreptimeDB using these user accounts.

Note: The content of the file is loaded into the database while starting up. Modifying or appending the file won't take effect while the database is up and running.

GreptimeDB also supports a quicker way of setting up one account(_mainly for debug usage_). Use `cmd` instead of `file` as second value and append username and password directly with same format.

```shell
# standalone mode
./greptime standalone start --user-provider=static_user_provider:cmd:alice=aaa
```
