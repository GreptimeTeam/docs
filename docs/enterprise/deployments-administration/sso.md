---
keywords: [GreptimeDB Enterprise, SSO, Okta, OIDC, JWT, JWKS, authentication]
description: Configure Okta SSO for GreptimeDB Enterprise, map identities to database users, and troubleshoot Dashboard login and token authentication.
---

# SSO Authentication

GreptimeDB Enterprise supports Dashboard single sign-on (SSO) with Okta using
OpenID Connect (OIDC). The Dashboard handles browser login; GreptimeDB validates
the access token and applies the database user's stored privileges and ACLs.
Password login remains available alongside SSO.

:::note Version compatibility
Use GreptimeDB Enterprise and Dashboard builds that support OIDC login discovery
and the verification mode described below. These instructions describe the
Nightly implementation; do not assume that older Enterprise releases or
Dashboard builds support it.
:::

## How It Works

The simplest Okta configuration uses an org issuer and a public application's
client ID. It does not require a custom Authorization Server, custom username
claim, client secret, or JWKS URL.

1. The Dashboard reads the public `GET /v1/auth/config` endpoint for available
   login methods.
2. It discovers the authorization endpoint from
   `<issuer>/.well-known/openid-configuration` and signs in using Authorization
   Code + PKCE.
3. The browser sends the **access token**, not the ID token, as
   `Authorization: Bearer <access_token>`. An optional dashboard-apiserver must
   forward this header unchanged, including opaque tokens.
4. GreptimeDB calls the issuer's introspection endpoint to check token activity,
   expiry, issuer, client ID, Bearer token type, and the `openid` scope. It then
   calls UserInfo with the same token and reads `preferred_username` by default.
5. GreptimeDB resolves that name to a database user. The Dashboard retrieves the
   resulting identity from `/v1/users/current`.

Omitting `jwks_url` in this mode does **not** skip token validation. The login
redirect comes from issuer discovery, not from the JWKS URL.

## Prerequisites

- Enable the [built-in enterprise user provider](/enterprise/user.md) on the
  standalone server or every externally accessible Frontend. `jwt_auth` requires
  `greptime_ee_user_provider`; it cannot be attached to an LDAP or static user
  provider instead.
- Use an SSO-capable Dashboard and, if deployed, a dashboard-apiserver that
  preserves Bearer authentication.
- Serve the Dashboard over HTTPS. PKCE requires a browser secure context;
  localhost is suitable for local development, not remote HTTP access.
- Allow both the browser and GreptimeDB to reach the relevant Okta HTTPS
  endpoints with trusted certificates. These are separate network paths.
- Assign only permitted users or groups to the Okta application. Application
  usernames must be administrator-controlled, unique after normalization, and
  not reassigned to another person.

## Configure Okta

Create an **OIDC Single-Page Application** with the following settings:

| Setting | Value |
| --- | --- |
| Grant type | Authorization Code + PKCE. |
| Client authentication | **None**, under General → Client Credentials. This is a public SPA, not a confidential Web Application. |
| Issuer | Your org URL, such as `https://your-org.okta.com`, not `/oauth2/default`. |
| Client ID | The application's public OAuth client ID, not a user ID, Authorization Server ID, or secret. |
| Sign-in redirect URI | `<Dashboard origin>/dashboard/auth/callback`. Match scheme, hostname, port, and path exactly. |
| Sign-out redirect URI | `<Dashboard origin>/dashboard/auth/login`. Configure Trusted Origins as required for the browser flow. |
| Username mapping | Keep the app's native `userName` mapping, exposed as `UserInfo.preferred_username`. Adjust App Profile Mapping if needed; no new claim is required. |
| Assignments | Only users or groups allowed to access the database. |

Refresh Token grant is optional; it is not needed for the initial login.
See [Okta's OIDC application settings](https://help.okta.com/oie/en-us/Content/Topics/Apps/Apps_App_Integration_Wizard_OIDC.htm)
and [org versus custom authorization servers](https://developer.okta.com/docs/concepts/auth-servers/).
Never put a client secret in the browser. PKCE protects the authorization-code
exchange; it does not make a public SPA capable of keeping a secret.

## Configure GreptimeDB

Add the following to the standalone or Frontend configuration, keeping other
server settings unchanged:

```toml
user_provider = "greptime_ee_user_provider:"

[[plugins]]
jwt_auth.issuer = "https://your-org.okta.com"
jwt_auth.client_id = "your-oidc-app-client-id"
```

Replace the issuer and client ID with your application values. Place the
top-level `user_provider` before any TOML tables, such as `[http]` or
`[[plugins]]`. Configure only one `jwt_auth` plugin per process.

The trailing `:` is required. An empty suffix means no account-seeding file; it
does not remove existing accounts or enable anonymous access. Users must already
exist unless you explicitly enable [automatic provisioning](#automatic-user-provisioning).

In a cluster, apply the same configuration to every serving Frontend and roll
out the change. Do not put these authentication options only on Metasrv or
Datanode. In standalone mode, configure the standalone process itself.

If the deployment already sets `GREPTIMEDB_FRONTEND__USER_PROVIDER` or an
equivalent startup option, do not add a competing configuration source. Check
the effective command line, mounted configuration, and relevant environment
variables. Updating a ConfigMap alone does not reload a running process; verify
each replica after restart. A configured `jwt_auth` without the enterprise user
provider causes startup to fail rather than silently disabling SSO.

For this minimal remote mode, omit `secret`, `public_key`, `jwks_url`,
`jwks_ca_cert_path`, `audience`, `algorithm`, and JWKS refresh options. Explicit
keys select a different [JWT verification mode](#explicit-jwt-and-jwks-verification).

### Optional Settings and Defaults

These defaults apply to the issuer/client-ID-only remote mode:

| Option | Default | Meaning |
| --- | --- | --- |
| `jwt_auth.username_claim` | `"preferred_username"` | Exact top-level UserInfo field. Must be a non-empty string; no fallback to `email` or `sub`, and no nested JSON path lookup. |
| `jwt_auth.scopes` | `["openid", "profile", "email"]` | Browser login scopes. Must include `openid`; does not request `offline_access` by default. |
| `jwt_auth.display_name` | `"SSO"` | Login button label. |
| `jwt_auth.auto_provision` | `false` | Whether to create missing database users on first successful token login. |
| `jwt_auth.auto_provision_privileges` | `[]` | Required and non-empty when provisioning is enabled; must not include `Admin`. |
| `jwt_auth.auto_provision_databases` | `[]` | Required and non-empty when provisioning is enabled; grants access to all tables in the selected databases, subject to global privileges. |

To enable session renewal, enable Refresh Token grant in the Okta app and
explicitly request `offline_access` in addition to the default scopes:

```toml
jwt_auth.scopes = ["openid", "profile", "email", "offline_access"]
```

Add this setting inside the existing plugin, not a second plugin. Renewal is
possible only if the issuer actually returns a refresh token. Otherwise, users
must sign in again when the access token expires.

## Database Users and Permissions

By default, create the database user before SSO login through the
[User Management API](/enterprise/user/api.md). Use the normalized value of
`UserInfo.preferred_username` as the username. A manually created local account
still requires a strong local password; token authentication does not use it.

Usernames accept an ASCII identifier or a constrained email-shaped name, up to
128 bytes. Names containing `@` are lowercased; other names are case-sensitive.
See [username validation](/enterprise/user.md#username) for the exact rules.
Management APIs require the normalized, exact name.

Accounts are linked **by username**, not by a persisted `(issuer, sub)` binding.
Prevent name collisions, unintended mapping to an existing privileged account,
and reuse of former users' names. Renaming an IdP user requires an explicit
account migration. Okta groups and claims do not automatically map to database
roles or ACLs.

Tokens can never log in as the built-in lowercase `admin` user. For SSO
administration, use a different username and explicitly grant `Admin` after
review. Integrations that previously used an `admin` JWT must migrate to another
account when upgrading to this behavior.

### Automatic User Provisioning

To create missing users on their first successful token login, add the following
to the same plugin:

```toml
jwt_auth.auto_provision = true
jwt_auth.auto_provision_privileges = ["SqlSelect"]
jwt_auth.auto_provision_databases = ["public"]
```

This example creates read-only users for `public`. Provisioning:

- Is disabled by default and only creates users in the default catalog,
  `greptime`.
- Requires explicit, non-empty privileges and database selectors. `Admin` is
  forbidden. Invalid policy settings prevent startup.
- Grants all-table ACLs for each database selector. Selectors can be exact names
  or `~regex:<pattern>`; database patterns match the whole name.
- Uses a random strong password. Existing users retain their current privileges
  and ACLs; concurrent first logins do not overwrite an existing account.
- Requires issuer and client ID in remote OIDC mode, or issuer and audience in
  explicit JWT mode.

Admission is controlled by the IdP's application assignment and token policy.
Deleting a provisioned database user does not revoke access: another valid login
can recreate it. Revoke access at the IdP and verify the resulting behavior.

## Dashboard Login Discovery

No separate Okta issuer/client-ID configuration is needed in the Dashboard.
`GET /v1/auth/config` is public and returns only login metadata, not secrets.
For the minimal configuration above, the response is:

```json
{
  "auth_required": true,
  "methods": [
    {
      "type": "oidc",
      "id": "oidc",
      "display_name": "SSO",
      "issuer": "https://your-org.okta.com",
      "client_id": "your-oidc-app-client-id",
      "scopes": ["openid", "profile", "email"]
    },
    {"type": "password"}
  ]
}
```

The following login page shows an SSO button and a link to password login.
This example uses Keycloak; the SSO button label reflects the configured
`jwt_auth.display_name`.

![Enterprise Dashboard login page with SSO and password login options](/ent_user/sso-login.png)

The Dashboard offers the returned methods and can remember the last selected
method. Without an OIDC login configuration, the enterprise provider advertises
only `password`. Without a user provider, the response is
`{"auth_required": false, "methods": []}`. Older servers without the endpoint
return `404`, and compatible Dashboards fall back to password login.

With dashboard-apiserver, discovery uses
`/api/v1/instances/<instance>/greptime/v1/auth/config`. Ensure the configured
instance points to the intended Frontend and that gateways allow unauthenticated
access to this endpoint. `enableUserAuthentication` controls the login UI only;
it is not a substitute for server-side authentication. Hiding password login
does not disable HTTP Basic authentication or enforce SSO-only access.

SSO tokens and OIDC state are kept in memory and tab-scoped `sessionStorage`, not
`localStorage`; SSO does not require storing a database password. The remembered
login-method choice is not a credential. Do not assume session storage is shared
across tabs.

When a refresh token is available, the Dashboard attempts renewal before access
token expiry and after a `401`; failed renewal ends the local session and sends
the user back to login. Signing out clears local SSO state and attempts an IdP
end-session redirect. Verify both local cleanup and IdP logout; local cleanup
alone does not revoke an access token or end the Okta session.

## Programmatic and SQL Clients

| Protocol | Token authentication |
| --- | --- |
| HTTP | `Authorization: Bearer <access_token>` or `x-greptime-auth: Bearer <access_token>`. |
| MySQL | Username `*`, access token as the password, and the `mysql_clear_password` plugin, for example `mysql --enable-cleartext-plugin`. Use TLS. |
| PostgreSQL | Username `*`, access token as a cleartext password. Use TLS. |
| gRPC | Token authentication is not supported; use username/password authentication. |

Remote OIDC supports opaque access tokens; clients do not need to decode them.
Each new authentication contacts the IdP. An authenticated SQL connection is not
revalidated for every statement and is not proactively disconnected when its
token is revoked.

## Explicit JWT and JWKS Verification

Existing deployments can continue to verify JWT access tokens locally with an
explicit key source. This is a different mode from the minimal Okta org setup.
Use an issuer whose access tokens are intended for your API; do not locally
validate Okta org-server access tokens as if they were custom-server JWTs.

For example, with a custom authorization server:

```toml
user_provider = "greptime_ee_user_provider:"

[[plugins]]
jwt_auth.jwks_url = "https://your-org.okta.com/oauth2/your-server-id/v1/keys"
jwt_auth.issuer = "https://your-org.okta.com/oauth2/your-server-id"
jwt_auth.audience = "api://greptimedb"
jwt_auth.algorithm = "RS256"
jwt_auth.username_claim = "greptime_user"
jwt_auth.client_id = "your-oidc-app-client-id"
```

The audience and username claim must match your authorization server's access
tokens. `greptime_user` is an example custom claim, not a requirement for remote
OIDC. This mode defaults to `username_claim = "sub"` and browser scopes
`["openid", "profile", "email", "offline_access"]`. Explicitly set the claim
when `sub` does not identify your database user. Omit `client_id` for
programmatic-only JWT verification without a Dashboard SSO entry.

Key sources are mutually exclusive: `secret` (HMAC), `public_key` (PEM RSA/EC),
or `jwks_url`. Supported algorithms are HS256/384/512, RS256/384/512, and
ES256/384; JWKS defaults to the supported RSA/EC algorithms, not HMAC.
JWT validation requires `exp`, checks `nbf` when present, and allows 60 seconds
of clock skew. Configured issuer and audience must be present and match.

JWKS is fetched at startup; an initial fetch failure prevents startup. Keys are
refreshed every 3600 seconds by default (`jwks_refresh_interval_secs`, minimum
60). An unknown `kid` triggers refresh, throttled by
`jwks_min_refresh_interval_secs` (default 60, clamped between 1 and the periodic
interval). Administrators can also [refresh JWKS keys](/enterprise/user/api.md#refresh-jwks-keys)
on each server.

Use HTTPS for JWKS URLs; HTTP is permitted only on loopback for development.
For a private CA, set `jwt_auth.jwks_ca_cert_path` to a PEM bundle mounted on
every serving Frontend or standalone server. It adds trust only for the JWKS
client; a missing or unusable file prevents startup. It is **not** a CA setting
for remote OIDC discovery, introspection, or UserInfo.

A Keycloak/JWKS compatibility test does not establish compatibility with Okta's
remote public-client introspection. Verify each mode independently; removing
`jwks_url` alone is not sufficient to migrate an arbitrary IdP.

## Verification and Troubleshooting

After rollout:

1. Confirm every Frontend or standalone process is ready and discovery succeeded.
2. Inspect the status, content type, and raw JSON from `/v1/auth/config`, both
   directly and through any proxy. Verify issuer, client ID, scopes, and methods.
3. Complete a real Dashboard login and check `/v1/users/current` for the expected
   normalized username and catalog.
4. Verify an allowed query, such as `SELECT 1`, and a valid operation the user's
   policy should deny. Confirm the database scope and ACLs, not just login.
5. Separately test first-login provisioning, expiry, revocation, page reload,
   new-tab behavior, and refresh/logout if enabled. Test real Okta remote mode
   rather than inferring success from another IdP or verification mode.

| Symptom | Check |
| --- | --- |
| Only a password form appears | Inspect `auth/config` first. Fetch failures can silently fall back to password login; the page alone does not prove the server returned password-only methods. |
| No discovery request, or valid OIDC JSON but no SSO entry | Check Dashboard build, JavaScript errors, instance selection, cached assets, and remembered login choice. OIDC entries require non-empty issuer and client ID. |
| Discovery returns `404`, `401`/`403`, or HTML | Check server version, proxy routes, gateway authentication, and SPA fallback. The endpoint must be public and return JSON. |
| Raw methods contain only `password` | Compare direct and proxied responses; check effective provider/plugin settings on every replica, actual config path, overrides, image version, and rollout completion. Adding username claims or ACLs does not publish a login method. |
| Redirect or code exchange fails | Check SPA type, Client authentication = None, application assignment, exact redirect URI, Trusted Origins, browser HTTPS trust, and PKCE/state handling. Do not add a client secret to the browser. |
| Okta login succeeds but `/v1/users/current` returns `401` | Send the access token, not the ID token; preserve Bearer through proxies. Check Frontend access to introspection/UserInfo, app/issuer/expiry/scope validation, UserInfo `sub` and username field, account existence, and catalog. |
| Login works but a query returns `403` | Inspect stored privileges and database/table ACLs. Provisioning does not overwrite existing permissions; do not grant `Admin` just to bypass an expected denial. |
| Session expires without renewal | Check Refresh Token grant, `offline_access`, whether a refresh token was actually issued, and renewal errors. |

### Network and Operational Limits

Remote OIDC requires trusted HTTPS. Discovery's issuer must exactly match the
configured issuer; introspection and UserInfo endpoints must have the same
origin. The client does not follow redirects. Check DNS, proxies, and certificate
chains without disabling TLS verification. There is no dedicated private-CA
option for this remote mode.

Each successful remote authentication makes two IdP calls, introspection and
UserInfo, without caching successful tokens. Plan for IdP latency, availability,
and rate limits. This mode targets interactive SSO, not high-throughput machine
ingestion. Discovery failure prevents startup; verification endpoint failure
rejects authentication rather than allowing unverified access.

An inactive token is rejected on the next authentication. Existing SQL sessions
are not proactively closed. In explicit JWT mode, a revoked token can remain
usable until expiry or a relevant key-set change. Clearing browser session
storage or closing a tab removes local credentials, not necessarily the IdP
session or server-side token validity.

Only one IdP is supported. Remote mode requires public-client introspection
without a client secret and the response fields described above; arbitrary OIDC
providers are not necessarily compatible.

When sharing diagnostics, include versions, replica identities, request paths,
status codes, raw public login metadata, and redacted configuration/errors.
Never share passwords, client secrets, complete tokens, authorization codes,
Cookies, unredacted HAR files, full environment dumps, or Secret contents. Do
not upload credentials to third-party token decoders.
