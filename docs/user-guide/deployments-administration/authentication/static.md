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

### Password Formats

Since v1.1, a password can use an explicit verifier format, so that plaintext passwords don't have to live in the configuration file. By default a password is stored as plaintext:

- `plain:<password>` — plaintext. This is the default when no prefix is given.
- `pbkdf2_sha256:<iterations>:<hex_salt>:<hex_hash>` — a PBKDF2-SHA256 hash stored at rest.
- `mysql_native_password:<hex_sha1_sha1_password>` — a hashed verifier that still serves the MySQL `mysql_native_password` handshake.
- `pg_scram_sha256:<iterations>:<hex_salt>:<hex_stored_key>:<hex_server_key>` — a SCRAM-SHA-256 verifier that serves the PostgreSQL SASL handshake. Available since v1.2.

Example:

```
admin=plain:admin_pwd
alice=pbkdf2_sha256:4096:73616c74:c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a
bob=mysql_native_password:6bb4837eb74329105ee4568dda7dc67ed2ca2ad9
carol=pg_scram_sha256:4096:73616c74:53706a13f10b3c031b4c355d75ebd6500d3478062ce7d262710c3e60de02b93f:a19ce79824bd7ad68d96b8c00b0f1cc776bd0feca54d663301bb9866a860545b
```

Permission modes combine with verifier formats. The verifier goes after the `=`:

```
alice:readonly=pbkdf2_sha256:4096:73616c74:c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a
```

#### Protocol Compatibility

A single verifier format does not serve every protocol. Choose the format based on how clients connect:

| Verifier | HTTP/gRPC Basic | PostgreSQL SCRAM-SHA-256 | PostgreSQL cleartext | MySQL clear password | MySQL `mysql_native_password` |
| --- | --- | --- | --- | --- | --- |
| `plain:<password>` (or legacy `user=password`) | yes | yes | yes | yes | yes |
| `pbkdf2_sha256:...` | yes | no | yes | yes | no |
| `mysql_native_password:...` | no | no | no | no | yes |
| `pg_scram_sha256:...` | yes | yes | yes | yes | no |

`pbkdf2_sha256` protects passwords at rest; it does not change wire security. Cleartext-capable protocols still need TLS in production.

:::warning Breaking change
Passwords are prefix-parsed. A legacy plaintext password that literally starts with `plain:`, `pbkdf2_sha256:`, `mysql_native_password:`, or `pg_scram_sha256:` changes meaning. Use the `plain:` prefix to keep the literal value. For example, to keep the literal password `plain:secret`, configure it as `user=plain:plain:secret`.
:::

#### PostgreSQL SCRAM-SHA-256

SCRAM-SHA-256 lets PostgreSQL clients authenticate without sending the password in cleartext.

PostgreSQL negotiates a single authentication method when a connection starts. The server does receive the username at that point, but picking the method per user would reveal whether that user exists and what verifier format it uses. GreptimeDB therefore decides globally: it offers SCRAM only when **every** user in the credential file can do SCRAM — that is, every verifier is `plain:` or `pg_scram_sha256:`. An unknown username is answered with a throwaway verifier and still runs the full handshake, so a failed login looks the same as a wrong password.

:::warning
A single `pbkdf2_sha256:` or `mysql_native_password:` user makes the whole instance fall back to cleartext for PostgreSQL, including users whose own verifier supports SCRAM. If you want SCRAM, do not mix verifier formats.
:::

Channel binding (`SCRAM-SHA-256-PLUS`) is not supported.

You can check which method the server offers with libpq's `require_auth` parameter, which needs libpq or `psql` 16 or newer:

```shell
psql "host=127.0.0.1 port=4003 user=carol dbname=public require_auth=scram-sha-256"
```

When the instance has fallen back to cleartext, that command fails with `server requested a cleartext password`.

### Generating Password Verifiers

Since v1.1, you can use the `greptime user hash-password` command to generate a verifier string. It runs standalone without starting any server component:

```shell
./greptime user hash-password --password-stdin
```

This reads the plaintext password from stdin and prints the verifier to stdout. When run interactively, type the password and press Enter. In scripts, read it without echo and pipe it in, so the plaintext never appears in shell history or process listings:

```shell
read -rs PASSWORD && printf '%s' "$PASSWORD" | ./greptime user hash-password --password-stdin
```

Copy the output into your user file as the password:

```
admin=pbkdf2_sha256:4096:<random_hex_salt>:<hex_hash>
```

Options:

- `--format <FORMAT>` — verifier format, `pbkdf2_sha256` (default), `mysql_native_password`, or `pg_scram_sha256`.
- `--password <PASSWORD>` — plaintext password. Mutually exclusive with `--password-stdin`; exactly one is required. Prefer `--password-stdin` in scripts, since `--password` can leak through shell history or process listings.
- `--password-stdin` — read the plaintext password from stdin.
- `--iterations <N>` — PBKDF2-SHA256 / SCRAM-SHA-256 iteration count (default `4096`, range `1..=1000000`).
- `--salt-len <N>` — random salt length in bytes (default `16`, range `1..=1024`).
- `--salt-hex <HEX>` — fixed salt as hex instead of a random one, for deterministic automation.

To generate a `mysql_native_password` verifier instead:

```shell
./greptime user hash-password --password-stdin --format mysql_native_password
```

To generate a PostgreSQL SCRAM-SHA-256 verifier:

```shell
./greptime user hash-password --password-stdin --format pg_scram_sha256
```

### Starting the Server

Start the server with the `--user-provider` parameter and set it to `static_user_provider:file:<path_to_file>` (replace `<path_to_file>` with the path to your user configuration file):

```shell
./greptime standalone start --user-provider=static_user_provider:file:<path_to_file>
```

The users and their permissions will be loaded into GreptimeDB's memory. You can create connections to GreptimeDB using these user accounts with their respective access levels enforced.

:::tip Note
When using `static_user_provider:file`, the file’s contents are loaded at startup. Changes or additions to the file have no effect while the database is running.
:::

### Dynamic File Reloading

If you need to update user credentials without restarting the server, you can use the `watch_file_user_provider` instead of `static_user_provider:file`. This provider monitors the credential file for changes and automatically reloads it:

```shell
./greptime standalone start --user-provider=watch_file_user_provider:<path_to_file>
```

The watch file provider:
- Uses the same file format as the static file provider
- Automatically detects file modifications and reloads credentials
- Allows adding, removing, or modifying users without server restart
- If the file is temporarily unavailable or invalid, it keeps the last valid configuration

This is particularly useful in production environments where you need to manage user access dynamically.

## Kubernetes Cluster

You can configure the authentication users in the `values.yaml` file.
For more details, please refer to the [Helm Chart Configuration](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md#authentication-configuration).

