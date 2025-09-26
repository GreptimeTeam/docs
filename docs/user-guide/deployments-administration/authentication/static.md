---
keywords: [GreptimeDB, static user authentication, user credentials, configuration file, database authentication]
description: Instructions for setting up static user authentication in GreptimeDB using a configuration file with user credentials.
---

# Static User Provider

GreptimeDB offers a simple built-in mechanism for authentication, allowing users to configure either a fixed account for convenient usage or an account file for multiple user accounts. By passing in a file, GreptimeDB loads all users listed within it.

## Standalone Mode

GreptimeDB reads the user configuration from a file where each line defines a user with their password and optional permission mode.

### Basic Configuration

The basic format uses `=` as a separator between username and password:

```
greptime_user=greptime_pwd
alice=aaa
bob=bbb
```

Users configured this way have full read-write access by default.

### Permission Modes

You can optionally specify permission modes to control user access levels. The format is:

```
username:permission_mode=password
```

Available permission modes:
- `rw` or `readwrite` - Full read and write access (default when not specified)
- `ro` or `readonly` - Read-only access
- `wo` or `writeonly` - Write-only access

Example configuration with mixed permission modes:

```
admin=admin_pwd
alice:readonly=aaa
bob:writeonly=bbb
viewer:ro=viewer_pwd
editor:rw=editor_pwd
```

In this configuration:
- `admin` has full read-write access (default)
- `alice` has read-only access
- `bob` has write-only access
- `viewer` has read-only access
- `editor` has explicitly set read-write access

### Starting the Server

Start the server with the `--user-provider` parameter:

```shell
./greptime standalone start --user-provider=static_user_provider:file:<path_to_file>
```

The users and their permissions will be loaded into GreptimeDB's memory. You can create connections to GreptimeDB using these user accounts with their respective access levels enforced.

:::tip Note
When using `static_user_provider`, the file’s contents are loaded at startup. Changes or additions to the file have no effect while the database is running.
:::

### Dynamic File Reloading

If you need to update user credentials without restarting the server, you can use the `watch_file_user_provider` instead. This provider monitors the credential file for changes and automatically reloads it:

```shell
./greptime standalone start --user-provider=watch_file_user_provider:<path_to_file>
```

The watch file provider:
- Uses the same file format as the static provider
- Automatically detects file modifications and reloads credentials
- Allows adding, removing, or modifying users without server restart
- If the file is temporarily unavailable or invalid, it keeps the last valid configuration

This is particularly useful in production environments where you need to manage user access dynamically.

## Kubernetes Cluster

You can configure the authentication users in the `values.yaml` file.
For more details, please refer to the [Helm Chart Configuration](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md#authentication-configuration).

