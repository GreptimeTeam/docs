---
keywords: [authentication, user providers, static user provider, LDAP user provider]
description: Overview of authentication in GreptimeDB, including static user provider and LDAP user provider for authenticating users.
---

# Authentication

Authentication occurs when a user attempts to connect to the database. In GreptimeDB, users are authenticated by "user
provider"s. There are various implementations of user providers in GreptimeDB:

- [Static User Provider](./static.md): A simple built-in user provider implementation that finds users from a static
  file.
- [LDAP User Provider](/enterprise/deployments-administration/authentication.md): **Enterprise feature.** A user provider implementation that authenticates users against an external LDAP
  server.

