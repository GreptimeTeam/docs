---
keywords: [GreptimeDB Enterprise, user management, HTTP API, authentication, privileges, ACL]
description: HTTP API reference for creating, listing, inspecting, updating, and deleting GreptimeDB Enterprise users and refreshing JWKS keys.
---

# User Management API

Use these HTTP endpoints to manage accounts after enabling the
[built-in user provider](/enterprise/user.md) on a standalone server or frontend.
Requests and responses use JSON. Send `Content-Type: application/json` when
creating or updating a user.

## Authentication and Catalog Scope

Every endpoint requires authentication. Most require the `Admin` privilege;
authenticated users can also retrieve their own information.

Use HTTP Basic authentication:

```shell
curl -u '<username>:<password>' \
  'http://localhost:4000/v1/users/current'
```

When the `jwt_auth` plugin is configured, you can use a bearer token instead:

```shell
curl -H 'Authorization: Bearer <token>' \
  'http://localhost:4000/v1/users/current'
```

The token must identify an existing user. See
[External Authentication](/enterprise/user.md#external-authentication) for the
relationship between authentication plugins and stored user permissions.

All `/v1/users` operations use the request's current catalog, which defaults to
`greptime`. Usernames are unique within a catalog. Select another catalog with
the `db` query parameter or `x-greptime-db-name` header, using the
`<catalog>-<database>` format:

```shell
curl -u '<admin-user>:<admin-password>' \
  'http://localhost:4000/v1/users?db=tenant_a-public'
```

The equivalent header is `x-greptime-db-name: tenant_a-public`. If both are
present, the header takes precedence. Authentication looks up the user in the
selected catalog. The `catalog` field in a create request must match this
catalog; it does not select a different target.

In [standalone leader-follower deployments](/enterprise/deployments-administration/standalone-follower.md),
send management requests to the ready leader. Follower reads may use cached
credentials and permissions after user changes.

## Endpoints

| Method | Path | Access | Success status |
| --- | --- | --- | --- |
| `GET` | `/v1/users` | Admin | `200` |
| `GET` | `/v1/users/current` | Any authenticated user | `200` |
| `GET` | `/v1/users/{username}` | Admin or the named user | `200` |
| `POST` | `/v1/users` | Admin | `201` |
| `PUT` | `/v1/users/{username}` | Admin | `200` |
| `DELETE` | `/v1/users/{username}` | Admin | `200` |
| `POST` | `/v1/jwks/refresh` | Admin | `200` |

## User Object

User lookups return the following object. Listing users returns an array of
these objects. Passwords, password hashes, and protocol verifiers are not
included in responses.

| Field | Type | Description |
| --- | --- | --- |
| `username` | string | Username within the catalog. |
| `catalog` | string | Catalog where the account is stored. |
| `privileges` | unsigned 32-bit integer | [Privilege bitmask](#privileges). |
| `acl_map` | object | [Database and table ACLs](#acl-map). |
| `created_at` | signed 64-bit integer | Creation time, in Unix milliseconds. |
| `updated_at` | signed 64-bit integer | Last update time, in Unix milliseconds. |

```json
{
  "username": "alice",
  "catalog": "greptime",
  "privileges": 8,
  "acl_map": {
    "public": [{"type": "match", "table": "cpu_metrics"}]
  },
  "created_at": 1705312345678,
  "updated_at": 1705312345678
}
```

### Privileges

Combine flags with bitwise OR. For example, `SqlSelect | SqlInsert` is
`8 | 16 = 24`. Unknown bits are rejected. The default value `0` grants no global
privileges. `Admin` grants full administrative privileges and bypasses ACL checks.

| Privilege | Value |
| --- | ---: |
| `TableCreate` | `1` |
| `TableAlter` | `2` |
| `TableDrop` | `4` |
| `SqlSelect` | `8` |
| `SqlInsert` | `16` |
| `SqlDelete` | `32` |
| `FlowCreate` | `256` |
| `FlowDrop` | `512` |
| `DatabaseCreate` | `1024` |
| `DatabaseAlter` | `2048` |
| `DatabaseDrop` | `4096` |
| `Admin` | `8192` |
| `TriggerCreate` | `16384` |
| `TriggerDrop` | `32768` |
| `TriggerAlter` | `65536` |

See [Privileges and ACLs](/enterprise/user.md#privileges-and-acls) for the
operations each flag permits and how privileges interact with ACLs.

### ACL Map

The `acl_map` object maps database (schema) selectors to arrays of table ACL
entries. An ordinary key such as `public` selects an exact database name.
A key beginning with `~regex:` selects databases by regular expression.

| Entry | Fields | Access |
| --- | --- | --- |
| `{"type": "all"}` | No additional fields | All tables in matching databases. |
| `{"type": "match", "table": "cpu_metrics"}` | `table`: string | The table with that exact name. |
| `{"type": "regex", "pattern": "^cpu_.*$"}` | `pattern`: string | Tables whose names match the regular expression. |

Database regular expressions match the entire name. Table regular expressions
match substrings unless anchored with `^` and `$`. Entries from overlapping
database selectors are combined; an `all` entry grants access to every table
in that database. Invalid regular expressions and empty database regular
expressions are rejected.

For example, this map grants access to `cpu_metrics` in `public` and every table
in databases named `tenant_1`, `tenant_42`, and so on:

```json
{
  "public": [{"type": "match", "table": "cpu_metrics"}],
  "~regex:tenant_[0-9]+": [{"type": "all"}]
}
```

For non-admin users, `{}` grants no access to ordinary databases. Empty arrays
grant no table access and are omitted when create and update requests are
stored. System-schema access and database creation have separate rules; see
[Privileges and ACLs](/enterprise/user.md#privileges-and-acls).

## List Users

`GET /v1/users` requires `Admin` and returns a JSON array of user objects in the
current catalog. The result is not paginated.

```shell
curl -u '<admin-user>:<admin-password>' \
  'http://localhost:4000/v1/users'
```

Success: `200 OK`. Each array element has the [user object](#user-object) format.

## Get the Current User

`GET /v1/users/current` returns the authenticated user's information. It does
not require `Admin`.

```shell
curl -u '<username>:<password>' \
  'http://localhost:4000/v1/users/current'
```

Success: `200 OK` with a [user object](#user-object) from the authentication
context.

## Get a User

`GET /v1/users/{username}` returns the named user in the current catalog. Admins
can retrieve any user; other users can retrieve only their own information.

```shell
curl -u '<admin-user>:<admin-password>' \
  'http://localhost:4000/v1/users/alice'
```

Success: `200 OK` with a [user object](#user-object). A missing user returns `404`.

## Create a User

`POST /v1/users` requires `Admin`.

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `username` | string | Yes | — | Must match `^[a-zA-Z][a-zA-Z0-9_]*$`. |
| `password` | string | Yes | — | 6 to 64 characters. |
| `catalog` | string | No | Current catalog | Must match the request's current catalog if supplied. |
| `privileges` | unsigned 32-bit integer | No | `0` | Privilege bitmask. |
| `acl_map` | object | No | `{}` | Database and table ACLs. |

Create a user that can read `public.cpu_metrics`:

```shell
curl -X POST -u '<admin-user>:<admin-password>' \
  'http://localhost:4000/v1/users' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "alice",
    "password": "alice_password",
    "privileges": 8,
    "acl_map": {
      "public": [{"type": "match", "table": "cpu_metrics"}]
    }
  }'
```

Success: `201 Created`.

```json
{"message": "User created successfully"}
```

An existing username in the current catalog returns `409 Conflict`.

## Update a User

`PUT /v1/users/{username}` requires `Admin`. Supply at least one field with a
non-null value. Omitted fields retain their current values.

| Field | Type | Description |
| --- | --- | --- |
| `password` | string | New password, 6 to 64 characters. |
| `privileges` | unsigned 32-bit integer | Replaces the entire privilege bitmask. |
| `acl_map` | object | Replaces the entire ACL map; entries are not merged with the stored map. |

This example grants read and insert privileges and replaces the ACL with access
to all tables in `public`:

```shell
curl -X PUT -u '<admin-user>:<admin-password>' \
  'http://localhost:4000/v1/users/alice' \
  -H 'Content-Type: application/json' \
  -d '{
    "privileges": 24,
    "acl_map": {"public": [{"type": "all"}]}
  }'
```

Success: `200 OK`.

```json
{"message": "User updated successfully"}
```

Only `password`, `privileges`, and `acl_map` can be updated; other fields in
the request body, such as `username` or `catalog`, are ignored.
Removing `Admin` from the protected `admin` account returns `403` and
rejects the entire update, including password or ACL changes in the same request.
A missing user returns `404`. Concurrent updates can return `409`; read the
latest user information before deciding whether to retry.

## Delete a User

`DELETE /v1/users/{username}` requires `Admin`. You cannot delete your own account
or the protected `admin` account; these requests return `403`.

```shell
curl -X DELETE -u '<admin-user>:<admin-password>' \
  'http://localhost:4000/v1/users/alice'
```

Success: `200 OK`.

```json
{"message": "User 'alice' deleted successfully"}
```

A missing user returns `404`.

## Refresh JWKS Keys

`POST /v1/jwks/refresh` requires `Admin` and requests an immediate refresh of the
JWT verification keys from the configured JWKS URL. It refreshes only the server
receiving the request.

```shell
curl -X POST -u '<admin-user>:<admin-password>' \
  'http://localhost:4000/v1/jwks/refresh'
```

Success: `200 OK`, with the number of usable keys in the current key set:

```json
{"keys": 2}
```

If JWT authentication is disabled or uses a static key instead of a JWKS URL,
the endpoint returns `400`. A failed refresh returns `502` and keeps the previous
cached key set.

## Errors

Validation and user-management errors include an `error` message:

```json
{"error": "User 'alice' already exists"}
```

Authentication and server errors can also include `code` and `execution_time_ms`
fields. Use the HTTP status to distinguish error categories.

| Status | Meaning |
| --- | --- |
| `400 Bad Request` | Malformed JSON, invalid username, password, privilege bits, or ACLs; mismatched catalog; or an empty update. Also returned when JWKS refresh is not configured. |
| `401 Unauthorized` | Missing or invalid credentials, invalid token, or authentication denied for the selected catalog/database. |
| `403 Forbidden` | Insufficient privileges or a protected-account operation. |
| `404 Not Found` | The requested user does not exist. |
| `409 Conflict` | Duplicate username or a concurrent update conflict. |
| `413 Payload Too Large` | Request body exceeds the server's limit. |
| `415 Unsupported Media Type` | Missing or unsupported JSON content type on a create or update request. |
| `422 Unprocessable Entity` | JSON does not match the request schema, such as a missing required field or a wrong field type. |
| `500 Internal Server Error` | Server or metadata operation failed. |
| `502 Bad Gateway` | JWKS refresh failed; the previous key set is retained. |
