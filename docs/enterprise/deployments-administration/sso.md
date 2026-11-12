---
keywords: [GreptimeDB Enterprise, SSO, Okta, OIDC, authentication]
description: Set up Okta SSO for GreptimeDB Enterprise, provision database users, and sign in to the Dashboard.
---

# SSO Authentication

Use OpenID Connect (OIDC) single sign-on (SSO) with Okta to access the
GreptimeDB Enterprise Dashboard. The Dashboard completes the Authorization
Code + PKCE flow and sends the resulting access token to GreptimeDB.
GreptimeDB verifies the token with Okta, maps it to a database user, and
applies that user's privileges and ACLs. Password login remains available
alongside SSO.

:::note Version compatibility
These instructions apply to Nightly. Use GreptimeDB Enterprise and Dashboard
builds that support SSO; older builds may not support this configuration.
:::

## How It Works

1. The Dashboard requests the unauthenticated `GET /v1/auth/config` endpoint
   to discover the available login methods. When GreptimeDB serves the
   Dashboard directly, the Dashboard calls this endpoint on GreptimeDB itself;
   through dashboard-apiserver it uses
   `/api/v1/instances/<instance>/greptime/v1/auth/config`.
2. The Dashboard and GreptimeDB use `<issuer>/.well-known/openid-configuration`
   to discover the OIDC endpoints. The Dashboard starts Authorization Code +
   PKCE login at the discovered authorization endpoint; `jwks_url` is not a
   login endpoint and is not used in this configuration.
3. After login, the browser sends the **access token**, not the ID token, as a
   Bearer credential. dashboard-apiserver forwards the credential unchanged.
4. With only `issuer` and `client_id` configured—without `secret`,
   `public_key`, or `jwks_url`—GreptimeDB verifies the token remotely. It uses
   Okta introspection to check that the token is active, unexpired, issued by
   the configured issuer to the configured client, and has the `Bearer` type
   and `openid` scope. It then reads UserInfo and obtains the database username
   from `preferred_username` by default.
5. GreptimeDB resolves that username to a database user and returns the user
   information through `/v1/users/current`. Subsequent Dashboard requests use
   the same Bearer credential and are verified the same way on every request,
   while privileges and ACLs remain under GreptimeDB's control.

This remote OIDC mode also supports opaque access tokens; neither the
Dashboard nor GreptimeDB needs to parse the access token as a JWT.

## Prerequisites

- Enable the [built-in enterprise user provider](/enterprise/user.md),
  `greptime_ee_user_provider`, on the standalone server or every serving Frontend.
  Do not use an LDAP or static user provider for this setup.
- Use an SSO-capable Dashboard and, if deployed, a dashboard-apiserver that
  supports Bearer authentication.
- Serve the Dashboard over HTTPS. Both the browser and GreptimeDB must be able
  to access Okta over HTTPS with trusted certificates. GreptimeDB must reach
  Okta's discovery, introspection, and UserInfo endpoints, and the public Okta
  application must support introspection without a client secret.
- Have permission to create an Okta application and assign users or groups.

## Configure Okta

Create an **OIDC Single-Page Application** with the following settings:

| Setting | Value |
| --- | --- |
| Grant type | Authorization Code + PKCE. |
| Client authentication | **None**, under General → Client Credentials. Do not configure a client secret. |
| Issuer | Your org URL, such as `https://your-org.okta.com`, not `/oauth2/default`. |
| Client ID | Copy the application's OAuth client ID. |
| Sign-in redirect URI | `<Dashboard origin>/dashboard/auth/callback`. Match scheme, hostname, port, and path exactly. |
| Sign-out redirect URI | `<Dashboard origin>/dashboard/auth/login`. Configure Trusted Origins as required. |
| Username mapping | Keep the app's native `userName` mapping. Adjust App Profile Mapping if needed. |
| Assignments | Only users or groups allowed to access the database. |

For example, a Dashboard at `https://dashboard.example.com/dashboard/` uses
`https://dashboard.example.com/dashboard/auth/callback` as its sign-in redirect
URI.

No custom Authorization Server, custom claim, or JWKS URL is needed for this
setup. See [Okta's OIDC application settings](https://help.okta.com/oie/en-us/Content/Topics/Apps/Apps_App_Integration_Wizard_OIDC.htm)
for details.

## Configure GreptimeDB

Add the following to the standalone or Frontend configuration, replacing the
issuer and client ID with your application values:

```toml
user_provider = "greptime_ee_user_provider:"

[[plugins]]
jwt_auth.issuer = "https://your-org.okta.com"
jwt_auth.client_id = "your-oidc-app-client-id"
```

- Place the top-level `user_provider` before any TOML tables, such as `[http]`
  or `[[plugins]]`. Keep the trailing `:`; it enables the provider without an
  account-seeding file and does not remove existing users.
- Configure only one `jwt_auth` plugin per process. For this setup, do not add
  `secret`, `public_key`, `jwks_url`, `jwks_ca_cert_path`, `audience`, `algorithm`,
  or JWKS refresh options.
- In a cluster, configure every serving Frontend, not Metasrv or Datanode.
  In standalone mode, configure the standalone process.
- If your deployment already enables the provider through an environment
  variable or startup option, avoid conflicting settings.

Restart the affected processes or roll out the Frontend changes, and confirm
that every replica is ready. Updating a ConfigMap alone does not reload the
configuration.

GreptimeDB performs OIDC discovery at startup. Startup fails if discovery is
unreachable or invalid, if the discovered issuer differs from `jwt_auth.issuer`,
or if the introspection and UserInfo endpoints are not on the issuer's origin.
It does not silently disable SSO and continue with password-only authentication.

### Optional Settings and Defaults

Add optional settings to the same `[[plugins]]` entry:

| Option | Default | Usage |
| --- | --- | --- |
| `jwt_auth.username_claim` | `"preferred_username"` | Top-level UserInfo field used as the database username. There is no fallback to `email` or `sub` if the selected field is missing or empty. |
| `jwt_auth.scopes` | `["openid", "profile", "email"]` | Requested login scopes; must include `openid`. |
| `jwt_auth.display_name` | `"SSO"` | Name displayed on the login button, for example `"Okta"`. |
| `jwt_auth.auto_provision` | `false` | Create missing users on first SSO login. |
| `jwt_auth.auto_provision_privileges` | `[]` | Initial privileges for new users; required when provisioning is enabled and must not include `Admin`. |
| `jwt_auth.auto_provision_databases` | `[]` | Databases new users can access; required when provisioning is enabled. |

## Database Users and Permissions

By default, create each user through the [User Management API](/enterprise/user/api.md)
before their first login. Use the Okta application's username
(`preferred_username`) as the database username. Email-shaped names must be
lowercase; other names are case-sensitive. See
[username validation](/enterprise/user.md#username) for accepted formats and the
128-byte limit. A manually created local account still requires a strong password,
but users do not enter that password for SSO.

Keep application usernames unique after normalization and do not reassign a
former user's name. When changing an Okta username, update the database account
accordingly and review its permissions. Manage privileges and ACLs in GreptimeDB;
Okta groups do not automatically grant database roles.

The built-in lowercase `admin` account cannot sign in using SSO or tokens.
For SSO administration, use another username and explicitly grant `Admin`.
Existing integrations using an `admin` JWT must switch to another account.

### Automatic User Provisioning

To create missing users on first login, add these settings to the same plugin:

```toml
jwt_auth.auto_provision = true
jwt_auth.auto_provision_privileges = ["SqlSelect"]
jwt_auth.auto_provision_databases = ["public"]
```

This grants new users read-only access to all tables in `public`. Both lists
must be non-empty; `Admin` is not allowed. Database entries can be exact names
or `~regex:<pattern>` selectors that match the entire database name.

In this remote OIDC mode, the configured issuer and client ID are the admission
boundary. Anyone who can obtain a valid token for that issuer and client can be
provisioned, so restrict the Okta application's assignments and access policies
to the intended users.

Automatic provisioning creates users only in the default catalog, `greptime`.
Existing users keep their current privileges and ACLs. An administrator can
adjust permissions later through the Dashboard or user API.

To revoke access, remove the user's access in Okta. Deleting an automatically
provisioned database user alone is insufficient: another valid login can
recreate the account.

## Sign In to the Dashboard

1. Open the Dashboard over HTTPS.
2. Select the SSO login button and complete Okta login.
3. After returning to the Dashboard, verify that you can query the intended
   databases, for example with `SELECT 1`.
4. Use the Dashboard's sign-out action when finished.

No separate Okta configuration is needed in the Dashboard. If you deploy
through dashboard-apiserver, enable its login UI with
`enableUserAuthentication` and point the instance at the correct Frontend.
This UI setting does not replace GreptimeDB authentication.

The screenshot below uses Keycloak as an example. The SSO button name follows
`jwt_auth.display_name`; the link below it switches to password login.

![Enterprise Dashboard login page with SSO and password login options](/ent_user/sso-login.png)

Password login is still available. Hiding its UI entry does not disable password
authentication. Signing out or closing a tab does not revoke an access token;
existing SQL connections may remain open after access is revoked in Okta.

### Enable Session Renewal

If users should stay signed in when their access token expires, enable the
Okta app's **Refresh Token** grant and refresh token rotation, and add
`offline_access` to the scopes in the same plugin:

```toml
jwt_auth.scopes = ["openid", "profile", "email", "offline_access"]
```

Without a refresh token, or if renewal fails, users must sign in again.

### Verify the Configuration

1. Before signing in, inspect `/v1/auth/config` directly or through the
   dashboard-apiserver path shown in [How It Works](#how-it-works). The response
   should contain an `oidc` method with the expected `issuer`, `client_id`, and
   `scopes`, followed by the `password` method. The endpoint is public but must
   not expose a client secret or other credentials.
2. Complete Okta login and confirm that `/v1/users/current` returns the
   intended database username and catalog.
3. Run a permitted query, such as `SELECT 1`, and verify that an operation
   outside the user's privileges or database ACLs is denied.
4. If automatic provisioning is enabled, use a new Okta user to confirm that
   the created account has only the configured initial privileges and database
   access. Also verify that an unassigned Okta user cannot sign in.

Do not include access tokens in screenshots, logs, or support requests while
performing these checks.

## Programmatic and SQL Clients

Use an **access token**, not an ID token, with these clients:

| Protocol | Usage |
| --- | --- |
| HTTP | Send `Authorization: Bearer <access_token>` or `x-greptime-auth: Bearer <access_token>`. |
| MySQL | Use username `*` and the access token as the password. Enable `mysql_clear_password`, for example with `mysql --enable-cleartext-plugin`, and use TLS. |
| PostgreSQL | Use username `*` and the access token as the password, and use TLS. |
| gRPC | Use username/password authentication; token authentication is not supported. |

Any proxy must preserve the Bearer authentication header. Never share tokens,
passwords, or client secrets in logs, screenshots, or support requests.

## Network, Certificates, and Availability

- Use trusted HTTPS certificates for browser and GreptimeDB connections to
  Okta. The discovered issuer must exactly match `jwt_auth.issuer`, and the
  introspection and UserInfo endpoints must have the same origin as the issuer.
  GreptimeDB does not follow redirects for these requests.
- The remote OIDC client uses the system trust roots. `jwks_ca_cert_path`
  applies only to an explicit JWKS configuration; it does not add a private CA
  for remote discovery, introspection, or UserInfo. Do not disable TLS
  verification to work around certificate errors.
- Every request that authenticates with the token triggers these calls: each
  Dashboard HTTP request and each new SQL connection performs one
  introspection and one UserInfo request, and successful tokens are not
  cached. Account for Okta availability, latency, and rate limits; validation
  cost grows with the request rate, not with the number of logins. This mode
  is intended for interactive SSO rather than high-throughput machine
  ingestion.
- Endpoint failures reject new authentication attempts; GreptimeDB does not
  fall back to unverified access. Revoking a token affects its next
  authentication, but does not disconnect an already authenticated SQL
  connection.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Only password login appears | Inspect the raw `auth/config` response directly and through dashboard-apiserver. Confirm that the Dashboard and GreptimeDB support SSO, the instance targets the correct Frontend, and every Frontend has restarted with the issuer and client ID configured. |
| `auth/config` returns `404`, `401`/`403`, HTML, or an error | Any failed fetch — `404`, another error status, or a network failure — makes the Dashboard silently fall back to password login, so judge the configuration from the raw response instead of the login page. For `404`, check the GreptimeDB version and proxy route; an older server does not provide this endpoint. A gateway must not require authentication for this public endpoint. HTML usually indicates an incorrect proxy route or SPA fallback rather than a valid JSON response. |
| `auth/config` returns only `password` | Check the effective configuration on every serving Frontend, including the actual mounted file and environment overrides. Confirm that `greptime_ee_user_provider`, one valid `jwt_auth` plugin, `issuer`, and `client_id` are loaded, and inspect startup logs for OIDC discovery failures. |
| GreptimeDB fails to start after OIDC is configured | Check issuer discovery connectivity, the exact issuer match, same-origin endpoints, and TLS certificates. Remove JWT-only options such as `audience`, `algorithm`, and JWKS refresh settings from this remote configuration. |
| Okta redirects or authorization-code exchange fails | Check the SPA application type, Client authentication = None, Authorization Code + PKCE, user assignment, exact callback URI, Trusted Origins, and HTTPS certificates. Do not put a client secret in the browser. |
| Okta login succeeds but GreptimeDB returns `401` | Confirm that the client sends the access token rather than the ID token and that proxies preserve the Bearer scheme. Check introspection and UserInfo connectivity, token issuer/client/scope/expiry, the selected UserInfo username field, and the matching database user or restricted automatic provisioning. |
| Login succeeds but queries are denied | Review the user's privileges and database/table ACLs. Existing users keep their permissions when automatic provisioning is enabled. Do not grant `Admin` merely to bypass an expected denial. |
| Users must sign in again after token expiry | Enable the Refresh Token grant and rotation, request `offline_access`, and confirm that Okta actually returns a refresh token. |

Only one identity provider is supported by this configuration. Another OIDC
provider must support the same public-client discovery, introspection without a
client secret, and UserInfo behavior; do not assume that Okta-specific setup
instructions apply unchanged.

The Dashboard stores OIDC tokens in sessionStorage, not localStorage. Closing a
tab or clearing browser storage removes only the local copy and does not revoke
the token.
