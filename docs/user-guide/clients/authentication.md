# Authentication

GreptimeDB has a simple built-in mechanism for authentication, allowing users to config either a fixed account for handy usage, or an account file for multiple user accounts.

Authentication happens when a user tries to connect to the database in the frontend (or standalone if using standalone mode). GreptimeDB supports passing in a file and loads all users listed within the file. GreptimeDB reads the user and password on each line using `=` as a separator, just like a command-line config. For example:

```
greptime_user=greptime_pwd
alice=aaa
bob=bbb
```

then start server with user provider

```shell
./greptime standalone start --user-provider=static_user_provider:file:<path_to_file>
```

Now, user `alice` with password `aaa` and user `bob` with password `bbb` are loaded into GreptimeDB's memory. You can create a connection to GreptimeDB using these user accounts.

Note: The content of the file is loaded into the database while starting up. Modifying or appending the file won't take effect while the database is up and running.
