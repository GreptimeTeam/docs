---
keywords: [LDAP, authentication, configuration, simple bind, search bind, user provider]
description: Configuration guide for LDAP authentication in GreptimeDB Enterprise, detailing both simple bind and search bind modes.
---

# LDAP Authentication

In addition to the built-in [static user provider](/user-guide/deployments-administration/authentication/static.md) in GreptimeDB OSS,
GreptimeDB Enterprise offers the capability to connect to an external LDAP server for authentication.

## Configuration

Similar to [LDAP in PostgreSQL](https://www.postgresql.org/docs/current/auth-ldap.html), in GreptimeDB, LDAP authentication is
operated in two modes: "simple bind" and "search bind", too.

In the "simple bind" mode, GreptimeDB will bind to the "DN"(distinguished name) constructed as
`{prefix}{username}{suffix}`. Typically, the `prefix` parameter is used to specify `cn=`, and the `suffix` is used to
specify the remaining part of the DN. The `username`, of course, is provided by the client.

Here's the configuration file example for the "simple bind" mode in GreptimeDB's LDAP user provider:

```toml
# Name or IP address of the LDAP server to connect to.
server = "127.0.0.1"
# Port number on LDAP server to connect to.
port = 636
# Set to "ldap" to use LDAP, "ldaps" to use LDAPS.
# The connection between GreptimeDB and the LDAP server starts as an initially unencrypted one,
# then upgrades to TLS as the first action against the server, per the LDAPv3 standard ("StartTLS").
scheme = "ldaps"

# The authentication mode to the LDAP server, either `bind = "simple"` or `bind = "search"`.
[auth_mode]
# The following options are used in simple bind mode only:
bind = "simple"
# String to prepend to the username when forming the DN to bind as, when doing simple bind authentication.
prefix = "cn="
# String to append to the username when forming the DN to bind as, when doing simple bind authentication.
suffix = ",dc=example,dc=com"
```

In the "search bind" mode, GreptimeDB will first try to bind to the LDAP directory with a fixed username and password,
which are set in the configuration file (`bind_dn` and `bind_passwd`), Then GreptimeDB performs a search for the user
trying to log in to the database. The search will be performed over the subtree at `base_dn`, filtered by the
`search_filter`, and will try to do an exact match of the attribute specified in `search_attribute`. Once the user has
been found in this search, GreptimeDB re-binds to the directory as this user, using the password specified by the
client, to verify that the login is correct. This method allows for significantly more flexibility in where the user
objects are located in the directory, but will cause two additional requests to the LDAP server to be made.

The following toml snippets show the configuration file example for the "search bind" mode in GreptimeDB's LDAP user
provider. The common parts of `server`, `port`, and `scheme` as shown in the "simple bind" mode configuration file above
are omitted:

```toml
[auth_mode]
# The following options are used in search bind mode only:
bind = "search"
# Root DN to begin the search for the user in, when doing search bind authentication.
base_dn = "ou=people,dc=example,dc=com"
# DN of user to bind to the directory with to perform the search when doing search bind authentication.
bind_dn = "cn=admin,dc=example,dc=com"
# Password for user to bind to the directory with to perform the search when doing search bind authentication.
bind_passwd = "secret"
# Attribute to match against the username in the search when doing search bind authentication.
# If no attribute is specified, the uid attribute will be used.
search_attribute = "cn"
# The search filter to use when doing search bind authentication.
# Occurrences of "$username" will be replaced with the username.
# This allows for more flexible search filters than search_attribute.
search_filter = "(cn=$username)"
```

## Use LDAP user provider in GreptimeDB

To use the LDAP user provider, first config your LDAP authentication mode like above, then start GreptimeDB with the
`--user-provider` parameter set to `ldap_user_provider:<path to your ldap configuration file>`. For example, if you have
a configuration file `/home/greptimedb/ldap.toml`, you can start a GreptimeDB standalone server with the following
command:

```shell
greptime standalone start --user-provider=ldap_user_provider:/home/greptimedb/ldap.toml
```

Now you can create a connection to GreptimeDB using your LDAP user accounts.

:::tip NOTE
If you are using the MySQL CLI to connect to GreptimeDB that is configured with LDAP user provider, you need
to specify the `--enable-cleartext-plugin` in the MySQL CLI.
:::
