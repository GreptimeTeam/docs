---
keywords: [用户, 权限, GreptimeDB 企业版, RBAC, ACL, 身份验证]
description: GreptimeDB 用户与权限机制概述。
---

# 内置用户管理

GreptimeDB 企业版提供了一个由 Meta Server 支持的内置用户与权限系统。
它支持基于角色的访问控制 (RBAC) 和细粒度访问控制列表 (ACL)，以确保数据安全和隔离。

## 主要特性

- **内置用户管理**：用户账号和权限存储在 Meta Server 中，确保整个集群管理的一致性。
- **基于角色的访问控制 (RBAC)**：为用户分配全局权限，控制 `SELECT`、`INSERT`、`CREATE TABLE` 等操作。
- **细粒度 ACL**：使用精确匹配或正则表达式控制特定 schema 内的表级访问。
- **动态管理**：通过 HTTP API 动态管理用户，无需重启服务器。
- **初始导入 (Initial Seeding)**：支持在启动时从密码文件导入初始账号。

## 快速上手

本节将介绍如何启用企业版用户 Provider 并进行基础的用户管理。

### 1. 启用用户 Provider

要使用企业版用户与权限系统，请在启动 GreptimeDB 时配置 `--user-provider` 参数。

**使用密码文件进行初始导入：**

```shell
./greptime standalone start \
  --user-provider=greptime_ee_user_provider:/path/to/passwords.txt
```

**不使用密码文件：**

```shell
./greptime standalone start \
  --user-provider=greptime_ee_user_provider:
```

> **注意**：配置解析器要求末尾必须带有冒号 `:`。

### 2. 初始账号导入（可选）

密码文件使用以下格式：
`<username>[:<role>]=<password>`

可用角色：
- `admin`：全部权限，包括用户管理。
- `readonly` (或 `ro`)：只读权限 (`SqlSelect`)。
- `writeonly` (或 `wo`)：只写权限（例如 `SqlInsert`、`TableCreate`）。
- `readwrite` (或 `rw`)：读写权限（默认）。

`passwords.txt` 示例：

```text
# username[:role]=password
superuser:admin=strong_password
alice:ro=alice_pwd
bob:rw=bob_pwd
```

默认情况下，导入的用户被授予对 `public` schema 的全部访问权限 (`AclType::All`)。

### 3. 通过 HTTP API 管理用户

服务器运行后，管理员用户可以通过 `/v1/users` HTTP API 管理其他用户。

#### 列出所有用户

```bash
curl -u admin:strong_password http://localhost:4000/v1/users
```

响应示例：

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

#### 获取特定用户

```bash
curl -u admin:strong_password http://localhost:4000/v1/users/charlie
```

> **注意**：非管理员用户只能检索自己的用户信息。

#### 获取当前用户

```bash
curl -u charlie:charlie_password http://localhost:4000/v1/users/current
```

此端点返回经过身份验证的用户信息，无需管理员权限。

#### 创建新用户

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

> **注意**：`privileges` 是 `UserPrivilege` 的位掩码。`8` 对应 `SqlSelect`。

#### 更新用户

```bash
curl -u admin:strong_password -X PUT http://localhost:4000/v1/users/charlie \
  -H "Content-Type: application/json" \
  -d '{
    "password": "new_secure_password",
    "privileges": 24
  }'
```

必须提供 `password`、`privileges` 或 `acl_map` 中的至少一个字段。

#### 删除用户

```bash
curl -u admin:strong_password -X DELETE http://localhost:4000/v1/users/charlie
```

> **注意**：`admin` 用户不能被删除。

## 权限与 ACL

### 全局权限

权限被定义为以下操作的位掩码：

| 权限 (Privilege) | 位值 (Bit Value) | 描述 |
| :--- | :--- | :--- |
| `TableCreate` | 1 | 创建新表 |
| `TableAlter` | 2 | 修改现有表 |
| `TableDrop` | 4 | 删除表 |
| `SqlSelect` | 8 | 执行 `SELECT` 查询 |
| `SqlInsert` | 16 | 执行 `INSERT` 操作 |
| `SqlDelete` | 32 | 执行 `DELETE` 操作 |
| `FlowCreate` | 256 | 创建 Flow |
| `FlowDrop` | 512 | 删除 Flow |
| `DatabaseCreate` | 1024 | 创建数据库 |
| `DatabaseAlter` | 2048 | 修改数据库 |
| `DatabaseDrop` | 4096 | 删除数据库 |
| `Admin` | 8192 | 完全管理权限 |
| `TriggerCreate` | 16384 | 创建触发器 |
| `TriggerDrop` | 32768 | 删除触发器 |
| `TriggerAlter` | 65536 | 修改触发器 |

#### 预定义角色权限

使用密码文件进行导入时，预定义角色映射到以下权限组合：

| 角色 (Role) | 权限 (Privileges) |
| :--- | :--- |
| `admin` | 所有权限 (131071) |
| `readonly` / `ro` | `SqlSelect` (8) |
| `writeonly` / `wo` | `SqlInsert`, `SqlDelete`, `TableCreate`, `TableAlter`, `TableDrop`, `FlowCreate`, `FlowDrop`, `TriggerCreate`, `TriggerDrop`, `TriggerAlter`, `DatabaseCreate`, `DatabaseAlter`, `DatabaseDrop` |
| `readwrite` / `rw` | `readonly` + `writeonly` 权限 |

### 访问控制列表 (ACL)

ACL 在 schema 内提供表级安全性。支持的类型：

- **all**：访问 schema 中的所有表。
  - 示例：`{"type": "all"}`
- **match**：按精确名称访问特定表。
  - 示例：`{"type": "match", "table": "cpu"}`
- **regex**：访问匹配正则表达式的表。
  - 示例：`{"type": "regex", "pattern": "mem_.*"}`（匹配任何以 `mem_` 开头的表）

#### ACL Map 示例

`acl_map` 是一个 JSON 对象，其中键是 schema 名称，值是 ACL 条目数组。

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

在此示例中，用户可以：
- 访问 `public` schema 中的 `cpu` 表。
- 访问 `public` schema 中任何以 `mem_` 开头的表。
- 访问 `monitoring` schema 中的所有表。

## 验证规则

### 用户名

用户名必须：
- 以字母开头 (`a-z` 或 `A-Z`)
- 仅包含字母、数字和下划线 (`[a-zA-Z][a-zA-Z0-9_]*`)

### 密码

密码长度必须至少为 6 个字符。

## 参考资料

- **管理员账号**：在系统首次启动时，如果默认 `admin` 账号尚不存在，GreptimeDB 企业版会自动创建一个。
  - 如果设置了环境变量 `GREPTIME_ENTERPRISE_ADMIN_PASSWORD`，则使用该值作为密码。
  - 如果未设置环境变量，则生成一个随机 UUID 作为密码。
- **查看自动生成的密码**：如果生成了随机密码，你可以在 GreptimeDB 日志文件中找到它。搜索如下消息：
  ```text
  Created admin user with auto-generated password <UUID>
  ```
- **默认 Catalog**：用户默认与 `greptime` catalog 相关联。
- **持久化**：用户信息持久化在 Meta Server 的 KV 存储中，使其在集群中的所有 Frontend 节点上可用。
- **管理员保护**：内置的 `admin` 用户无法通过 API 删除。
