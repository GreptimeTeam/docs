# Authentication

Authentication occurs when a user attempts to connect to the database. GreptimeDB offers a simple built-in mechanism for authentication, allowing users to configure either a fixed account for convenient usage or an account file for multiple user accounts. By passing in a file, GreptimeDB loads all users listed within it.

GreptimeDB reads the user and password on each line using `=` as a separator, just like a command-line config. For example:

```
greptime_user=greptime_pwd
alice=aaa
bob=bbb
```

then start server with `--user-provider` parameter:

```shell
./greptime standalone start --user-provider=static_user_provider:file:<path_to_file>
```

Now, user `alice` with password `aaa` and user `bob` with password `bbb` are loaded into GreptimeDB's memory. You can create a connection to GreptimeDB using these user accounts.

Note: The content of the file is loaded into the database while starting up. Modifying or appending the file won't take effect while the database is up and running.
