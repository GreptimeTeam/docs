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
- Each credential must contain exactly one `=`. Plaintext passwords containing `=` are not supported, including with the `plain:` prefix. Store a supported hashed verifier for such passwords.
- Whitespace around `=` is not removed from the username or password. Do not add spaces around the separator.
- If a username appears more than once, the last valid entry takes effect.
- Malformed entries are skipped. The file must exist and contain at least one valid credential; otherwise, provider initialization fails.
- A read error, including invalid UTF-8, stops parsing. Valid credentials read before the error can still be loaded.

Malformed entries and read errors produce warnings in the server log.

For MySQL and PostgreSQL connections, `*` is reserved for bearer-token authentication. These two providers do not support bearer tokens, so `*` cannot be used as a password-authenticated SQL username.

### Permission Modes

An optional permission mode controls read and write access. The format is:

```
username:permission_mode=password
```

Permission modes are case-insensitive:

- `rw`, `readwrite`, or `read_write` - Read and write access (default when omitted)
- `ro`, `readonly`, or `read_only` - Read-only access
- `wo`, `writeonly`, or `write_only` - Write-only access

An unrecognized permission mode makes the entry invalid: file providers skip the entry, while `static_user_provider:cmd` fails to initialize.

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

- `admin` has full read-write access (default)
- `alice` has read-only access
- `bob` has write-only access
- `viewer` has read-only access
- `editor` has explicitly set read-write access

### Password Formats

Since v1.1, passwords can be stored as plaintext or hashed verifiers. The supported formats are:

- `plain:<password>` — plaintext. This is the default when no prefix is given.
- `pbkdf2_sha256:<iterations>:<hex_salt>:<hex_hash>` — a PBKDF2-SHA256 hash stored at rest.
- `mysql_native_password:<hex_sha1_sha1_password>` — a hashed verifier for MySQL `mysql_native_password` authentication.
- `pg_scram_sha256:<iterations>:<hex_salt>:<hex_stored_key>:<hex_server_key>` — a SCRAM-SHA-256 verifier for PostgreSQL SASL authentication. Available since v1.2.

The hashed verifier examples below use the password `password` and, where required, the salt `salt`:

```
admin=plain:admin_pwd
alice=pbkdf2_sha256:4096:73616c74:c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a
bob=mysql_native_password:2470c0c06dee42fd1618bb99005adca2ec9d1e19
carol=pg_scram_sha256:4096:73616c74:945e1c466fc9932efadc23781edc5d1e78d5e10f005933652af1a6105154f084:b9bf0e811b1fb6793671c0cc3adedf7c75cd72291191092ad65878c5a02aad2c
```

Permission modes combine with verifier formats. The verifier goes after the `=`:

```
alice:readonly=pbkdf2_sha256:4096:73616c74:c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a
```

#### Protocol Compatibility

Protocol support depends on the verifier format and the authentication method selected by the provider:

| Verifier | HTTP/gRPC username/password | PostgreSQL SCRAM-SHA-256 | PostgreSQL cleartext | MySQL `mysql_native_password` |
| --- | --- | --- | --- | --- |
| `plain:<password>` (or legacy `user=password`) | yes | yes | yes | yes |
| `pbkdf2_sha256:...` | yes | no | yes | no |
| `mysql_native_password:...` | no | no | no | yes |
| `pg_scram_sha256:...` | yes | yes | yes | no |

`static_user_provider` and `watch_file_user_provider` negotiate `mysql_native_password`, not `mysql_clear_password`. Users configured with `pbkdf2_sha256` or `pg_scram_sha256` cannot authenticate over MySQL through these providers. Enabling TLS or a client's cleartext authentication plugin does not change the server's selected method.

Hashed verifiers protect stored credentials; they do not encrypt network traffic. Enable TLS for production connections, particularly when using HTTP/gRPC username/password authentication or PostgreSQL cleartext authentication.

:::warning Breaking change
Passwords are prefix-parsed. A legacy plaintext password that literally starts with `plain:`, `pbkdf2_sha256:`, `mysql_native_password:`, or `pg_scram_sha256:` changes meaning. Use the `plain:` prefix to keep the literal value. For example, to keep the literal password `plain:secret`, configure it as `user=plain:plain:secret`.
:::

#### PostgreSQL SCRAM-SHA-256

SCRAM-SHA-256 lets PostgreSQL clients authenticate without sending the password in cleartext.

GreptimeDB selects SCRAM-SHA-256 only when every configured user has a plaintext password (with or without `plain:`) or a `pg_scram_sha256:` verifier. These two formats can be mixed.

:::warning
A single `pbkdf2_sha256:` or `mysql_native_password:` entry makes PostgreSQL authentication fall back to cleartext for all users of that provider. A user with a `mysql_native_password:` verifier cannot authenticate through that fallback either, because the verifier cannot validate a cleartext password.
:::

The server logs a warning when loading credentials that disable PostgreSQL SCRAM authentication.

Channel binding (`SCRAM-SHA-256-PLUS`) is not supported.

After configuring all users with SCRAM-compatible credentials, verify the method with libpq or `psql` 16 or newer:

```shell
psql "host=127.0.0.1 port=4003 user=carol dbname=public require_auth=scram-sha-256"
```

When the instance has fallen back to cleartext, that command fails with `server requested a cleartext password`.

### Generating Password Verifiers

The `greptime user hash-password` command generates password verifiers without starting the server. It is available since v1.1:

```shell
./greptime user hash-password --password-stdin
```

The command reads one line from stdin, removes trailing carriage returns and newlines, and prints the verifier to stdout. Empty input is rejected. `--password-stdin` does not disable terminal echo. In Bash, read the password without echo before piping it to the command:

```bash
read -r -s password && printf '%s' "$password" | ./greptime user hash-password --password-stdin
```

Use the output as the password value in the user configuration file:

```
admin=pbkdf2_sha256:4096:<random_hex_salt>:<hex_hash>
```

Options:

- `--format <FORMAT>` — verifier format, `pbkdf2_sha256` (default), `mysql_native_password`, or `pg_scram_sha256`.
- `--password <PASSWORD>` — plaintext password. Mutually exclusive with `--password-stdin`; exactly one is required. Prefer `--password-stdin` in scripts, since `--password` can leak through shell history or process listings.
- `--password-stdin` — read one line containing the plaintext password from stdin.
- `--iterations <N>` — PBKDF2-SHA256 / SCRAM-SHA-256 iteration count (default `4096`, range `1..=1000000`).
- `--salt-len <N>` — random salt length in bytes (default `16`, range `1..=1024`).
- `--salt-hex <HEX>` — fixed salt as hex instead of a random one, overriding `--salt-len`. The decoded salt must contain `1..=1024` bytes.

`--iterations`, `--salt-len`, and `--salt-hex` apply only to salted formats and are ignored for `mysql_native_password`.

To generate a `mysql_native_password` verifier:

```shell
./greptime user hash-password --password-stdin --format mysql_native_password
```

To generate a PostgreSQL SCRAM-SHA-256 verifier:

```shell
./greptime user hash-password --password-stdin --format pg_scram_sha256
```

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
