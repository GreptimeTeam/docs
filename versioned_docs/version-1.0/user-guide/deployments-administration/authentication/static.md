---
keywords: [GreptimeDB, static user authentication, user credentials, configuration file, database authentication]
description: Instructions for setting up static user authentication in GreptimeDB using a configuration file with user credentials.
---

# Static User Provider

GreptimeDB supports username/password authentication with `static_user_provider`, which loads credentials from a file or a command-line argument at startup. `watch_file_user_provider` uses the same file format and reloads credentials when the file changes.

## Standalone Mode

GreptimeDB reads the user configuration from a file where each line defines a user with their password and optional permission mode.

### Basic Configuration

The basic format uses `=` as a separator between username and password:

```
greptime_user=greptime_pwd
alice=aaa
bob=bbb
```

Users configured this way have read-write access by default. File parsing follows these rules:

- Blank lines and lines starting with `#` are ignored after trimming leading and trailing whitespace from each line.
- Each credential must contain exactly one `=`. Passwords cannot contain `=`.
- Whitespace around `=` is not removed from the username or password. Do not add spaces around the separator.
- If a username appears more than once, the last valid entry takes effect.
- Malformed entries are skipped. The file must exist and contain at least one valid credential; otherwise, provider initialization fails.
- A read error, including invalid UTF-8, stops parsing. Valid credentials read before the error can still be loaded.

### Permission Modes

An optional permission mode controls read and write access. The format is:

```
username:permission_mode=password
```

Permission modes are case-insensitive:

- `rw`, `readwrite`, or `read_write` - Read and write access (default when omitted)
- `ro`, `readonly`, or `read_only` - Read-only access
- `wo`, `writeonly`, or `write_only` - Write-only access

:::warning
An unrecognized permission mode falls back to read-write access in v1.0. For example, `alice:readonyl=pwd` grants Alice read-write access. Check the spelling of permission modes before loading the configuration.
:::

These modes are not scoped to individual databases or tables.

Example configuration with mixed permission modes:

```
admin=admin_pwd
alice:readonly=aaa
bob:writeonly=bbb
viewer:ro=viewer_pwd
editor:rw=editor_pwd
```

In this configuration:

- `admin` has read-write access (default)
- `alice` has read-only access
- `bob` has write-only access
- `viewer` has read-only access
- `editor` has explicitly set read-write access

### Starting the Server

Set `--user-provider` to `static_user_provider:file:<path_to_file>`, replacing `<path_to_file>` with the user configuration file path:

```shell
./greptime standalone start --user-provider='static_user_provider:file:<path_to_file>'
```

The provider loads valid users and their permission modes into memory at startup. File changes take effect only after a restart.

Credentials can also be passed inline with `static_user_provider:cmd`. Separate entries with commas:

```shell
./greptime standalone start --user-provider='static_user_provider:cmd:admin=admin_pwd,alice:ro=alice_pwd'
```

The entries use the same credential syntax as the file. Inline plaintext passwords cannot contain `,` or `=`. Invalid entries fail provider initialization. Command-line credentials can appear in shell history and process listings; use a credential file for deployment.

### Dynamic File Reloading

`watch_file_user_provider` monitors a credential file and reloads users and permission modes without restarting the server:

```shell
./greptime standalone start --user-provider='watch_file_user_provider:<path_to_file>'
```

The file must exist and contain at least one valid credential at startup. On reload:

- If the file cannot be opened or contains no valid credentials, the provider retains the previous configuration.
- Otherwise, the loaded credentials replace the previous configuration. Malformed entries are skipped; they do not reject the entire file. Users omitted from the loaded result are removed, including users whose entries became invalid.

Reloading does not disconnect existing MySQL or PostgreSQL sessions or update the user information already attached to them. Changed credentials and permission modes apply to subsequent authentication.

## Kubernetes Cluster

Configure users in `values.yaml`. See the [Helm Chart Configuration](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md#authentication-configuration).
