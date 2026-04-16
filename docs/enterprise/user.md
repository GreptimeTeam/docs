---
keywords: [User, Permission, GreptimeDB Enterprise, RBAC, ACL, Authentication]
description: The overview of GreptimeDB User and Permission mechanism.
---

# User and Permission System

GreptimeDB Enterprise provides a persistent user and permission system based on
a persistent metadata backend (Meta Server). It supports Role-Based Access
Control (RBAC) and fine-grained Access Control Lists (ACLs) to ensure data
security and isolation.

## Key Features

- **Persistent Management**: User accounts and permissions are stored in the
  Meta Server, ensuring consistency across the cluster.
- **Role-Based Access Control (RBAC)**: Assign global privileges to users,
  controlling operations like `SELECT`, `INSERT`, `CREATE TABLE`, and more.
- **Fine-grained ACLs**: Control table-level access within specific schemas
  using exact matches or regular expressions.
- **Dynamic Management**: Manage users dynamically via HTTP APIs without
  restarting the server.
- **Initial Seeding**: Support for seeding initial accounts from a password
  file at startup.

## Quick Start

This section walks through how to enable the enterprise user provider and
perform basic user management.

### 1. Enable User Provider

To use the enterprise user and permission system, configure the `--user-provider`
parameter when starting GreptimeDB.

**With a password file for initial seeding:**

```shell
./greptime standalone start \
  --user-provider=greptime_ee_user_provider:/path/to/passwords.txt
```

**Without a password file:**

```shell
./greptime standalone start \
  --user-provider=greptime_ee_user_provider:
```

> **Note**: The trailing colon `:` is required by the configuration parser.

### 2. Initial Account Seeding (Optional)

The password file uses the following format:
`<username>[:<role>]=<password>`

Available roles:
- `admin`: Full privileges, including user management.
- `readonly` (or `ro`): Read-only access (`SqlSelect`).
- `writeonly` (or `wo`): Write-only access (e.g., `SqlInsert`, `TableCreate`).
- `readwrite` (or `rw`): Both read and write access (default).

Example `passwords.txt`:

```text
# username[:role]=password
superuser:admin=strong_password
alice:ro=alice_pwd
bob:rw=bob_pwd
```

Seeded users are granted full access (`AclType::All`) to the `public` schema by default.

### 3. Manage Users via HTTP API

Once the server is running, admin users can manage other users via the `/v1/users` HTTP API.

#### List all users

```bash
curl -u admin:strong_password http://localhost:4000/v1/users
```

Example response:

```json
[
  {
    "username": "admin",
    "catalog": "greptime",
    "privileges": 131071,
    "acl_map": {
      "public": [{ "type": "all" }]
    },
    "created_at": 1704067200000,
    "updated_at": 1704067200000
  }
]
```

#### Get a specific user

```bash
curl -u admin:strong_password http://localhost:4000/v1/users/charlie
```

> **Note**: Non-admin users can only retrieve their own user information.

#### Get current user

```bash
curl -u charlie:charlie_password http://localhost:4000/v1/users/current
```

This endpoint returns the authenticated user's information without requiring
admin privileges.

#### Create a new user

```bash
curl -u admin:strong_password -X POST http://localhost:4000/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "charlie",
    "password": "charlie_password",
    "privileges": 8,
    "acl_map": {
      "public": [
        { "type": "match", "table": "cpu" },
        { "type": "regex", "pattern": "mem_.*" }
      ]
    }
  }'
```

> **Note**: `privileges` is a bitmask of `UserPrivilege`. `8` corresponds to `SqlSelect`.

#### Update a user

```bash
curl -u admin:strong_password -X PUT http://localhost:4000/v1/users/charlie \
  -H "Content-Type: application/json" \
  -d '{
    "password": "new_secure_password",
    "privileges": 24
  }'
```

At least one field (`password`, `privileges`, or `acl_map`) must be provided.

#### Delete a user

```bash
curl -u admin:strong_password -X DELETE http://localhost:4000/v1/users/charlie
```

> **Note**: The `admin` user cannot be deleted.

## Privileges and ACLs

### Global Privileges

Privileges are defined as a bitmask of the following operations:

| Privilege | Bit Value | Description |
| :--- | :--- | :--- |
| `TableCreate` | 1 | Create new tables |
| `TableAlter` | 2 | Alter existing tables |
| `TableDrop` | 4 | Drop tables |
| `SqlSelect` | 8 | Execute `SELECT` queries |
| `SqlInsert` | 16 | Execute `INSERT` operations |
| `SqlDelete` | 32 | Execute `DELETE` operations |
| `FlowCreate` | 256 | Create flows |
| `FlowDrop` | 512 | Drop flows |
| `DatabaseCreate` | 1024 | Create databases |
| `DatabaseAlter` | 2048 | Alter databases |
| `DatabaseDrop` | 4096 | Drop databases |
| `Admin` | 8192 | Full administrative privileges |
| `TriggerCreate` | 16384 | Create triggers |
| `TriggerDrop` | 32768 | Drop triggers |
| `TriggerAlter` | 65536 | Alter triggers |

#### Predefined Role Privileges

When using the password file for seeding, the predefined roles map to the
following privilege combinations:

| Role | Privileges |
| :--- | :--- |
| `admin` | All privileges (131071) |
| `readonly` / `ro` | `SqlSelect` (8) |
| `writeonly` / `wo` | `SqlInsert`, `SqlDelete`, `TableCreate`, `TableAlter`, `TableDrop`, `FlowCreate`, `FlowDrop`, `TriggerCreate`, `TriggerDrop`, `TriggerAlter`, `DatabaseCreate`, `DatabaseAlter`, `DatabaseDrop` |
| `readwrite` / `rw` | `readonly` + `writeonly` privileges |

### Access Control Lists (ACLs)

ACLs provide table-level security within a schema. Supported types:

- **all**: Access to all tables in the schema.
  - Example: `{"type": "all"}`
- **match**: Access to a specific table by exact name.
  - Example: `{"type": "match", "table": "cpu"}`
- **regex**: Access to tables matching a regular expression.
  - Example: `{"type": "regex", "pattern": "mem_.*"}` (matches any table starting with `mem_`)

#### ACL Map Example

The `acl_map` is a JSON object where keys are schema names and values are arrays of ACL entries.

```json
{
  "public": [
    { "type": "match", "table": "cpu" },
    { "type": "regex", "pattern": "mem_.*" }
  ],
  "monitoring": [
    { "type": "all" }
  ]
}
```

In this example, the user can:
- Access the `cpu` table in the `public` schema.
- Access any table starting with `mem_` in the `public` schema.
- Access all tables in the `monitoring` schema.

## Validation Rules

### Username

Usernames must:
- Start with a letter (`a-z` or `A-Z`)
- Contain only letters, digits, and underscores (`[a-zA-Z][a-zA-Z0-9_]*`)

### Password

Passwords must be at least 6 characters long.

## Reference

- **Admin Account**: On the system's first startup, GreptimeDB Enterprise
  automatically creates a default `admin` account if it doesn't already exist.
  - If the environment variable `GREPTIME_ENTERPRISE_ADMIN_PASSWORD` is set,
    it uses that value as the password.
  - If the environment variable is not set, it generates a random UUID as the
    password.
- **Checking Auto-generated Password**: If a random password was generated,
  you can find it in the GreptimeDB log files. Search for a message like:
  ```text
  Created admin user with auto-generated password <UUID>
  ```
- **Default Catalog**: Users are associated with the `greptime` catalog by default.
- **Persistence**: User information is persisted in the Meta Server's KV store,
  making it available across all frontend nodes in a cluster.
- **Admin Protection**: The built-in `admin` user cannot be deleted via the API.
