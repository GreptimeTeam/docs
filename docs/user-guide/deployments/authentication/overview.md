# Overview

Authentication occurs when a user attempts to connect to the database. In GreptimeDB, users are authenticated by "user
provider"s. There are various implementations of user providers in GreptimeDB:

- [Static User Provider](./static.md): A simple built-in user provider implementation that finds users from a static
  file.
- [LDAP User Provider](/enterprise/deployments/authentication.md): **Enterprise feature.** A user provider implementation that authenticates users against an external LDAP
  server.

