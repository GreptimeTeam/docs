# Authentication

Authentication occurs when a user attempts to connect to the database. In GreptimeDB, users are authenticated by "user
provider"s. There are various implementations of user providers in GreptimeDB:

- [Static user provider](./static.md): a simple built-in user provider implementation that finds users from a static
  file.
- [LDAP user provider](./ldap.md): a user provider implementation that authenticates users against an external LDAP
  server.

:::tip NOTE

**LDAP user provider is only available in GreptimeDB Enterprise.**

:::
