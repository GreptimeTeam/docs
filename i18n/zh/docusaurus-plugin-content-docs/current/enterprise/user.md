---
keywords: [用户, 权限, GreptimeDB 企业版, RBAC, ACL, 身份验证]
description: GreptimeDB 用户与权限机制概述。
---

# 内置用户管理

GreptimeDB 企业版提供了基于元数据存储的内置用户与权限系统。在集群模式中，
该存储由 Metasrv 管理；在单机模式中，用户信息保存在 standalone 的元数据后端。
该系统支持基于角色的访问控制 (RBAC) 和细粒度访问控制列表 (ACL)，用于保障
数据安全与隔离。

## 主要特性

- **内置用户管理**：用户账号和权限持久化在元数据存储中，并在集群中的
  frontend 节点之间共享。
- **基于角色的访问控制 (RBAC)**：为用户分配全局权限，控制 `SELECT`、
  `INSERT`、`CREATE TABLE` 等操作。
- **细粒度 ACL**：使用精确名称或正则表达式选择数据库和表，控制访问权限。
- **动态管理**：通过 HTTP API 动态管理用户，无需重启服务器。
- **初始账号导入**：支持在启动时从密码文件导入初始账号。

## 配置说明

本节介绍如何启用企业版用户 Provider 并执行基础的用户管理操作。

### 1. 启用用户 Provider

要使用企业版用户与权限系统，需要在接收客户端请求的组件中启用
`greptime_ee_user_provider`。在单机模式中，请在 standalone server 上配置；
在集群模式中，请在每个 frontend 节点上配置。

用户 Provider 的取值如下：

```text
greptime_ee_user_provider:<path-to-password-file>
```

密码文件是可选的，仅用于初始账号导入。若要在不导入用户的情况下启用
Provider，请使用 `greptime_ee_user_provider:`。配置解析器要求保留末尾的
冒号 `:`。

**Standalone 命令行：**

```shell
./greptime standalone start \
  --user-provider=greptime_ee_user_provider:/path/to/passwords.txt
```

**Standalone 配置文件：**

```toml
user_provider = "greptime_ee_user_provider:/path/to/passwords.txt"
```

```shell
./greptime standalone start \
  -c /path/to/standalone.toml
```

**Frontend 命令行：**

```shell
./greptime frontend start \
  --metasrv-addrs=127.0.0.1:3002 \
  --user-provider=greptime_ee_user_provider:/path/to/passwords.txt
```

**Frontend 配置文件：**

```toml
user_provider = "greptime_ee_user_provider:/path/to/passwords.txt"

[meta_client]
metasrv_addrs = ["127.0.0.1:3002"]
```

然后使用配置文件启动 frontend：

```shell
./greptime frontend start \
  -c /path/to/frontend.toml
```

### 2. 初始账号导入（可选）

密码文件使用以下格式：
`[<catalog>/]<username>[:<role>]=<password>`

catalog 前缀是可选的。省略时，账号属于默认 catalog `greptime`。

可用角色：

- `admin`：拥有完整权限，包括用户管理权限。
- `readonly`（或 `ro`）：只读访问权限 (`SqlSelect`)。
- `writeonly`（或 `wo`）：只写访问权限，例如 `SqlInsert`、`TableCreate`。
- `readwrite`（或 `rw`）：同时拥有读写访问权限（默认）。

`passwords.txt` 示例：

```text
# [catalog/]username[:role]=password
superuser:admin=strong_password
alice:ro=alice_pwd
bob:rw=bob_pwd
tenant_a/carol:ro=carol_pwd
```

`admin` 是保留用户名，导入时会跳过。导入管理员账号时，请使用 `superuser`
等其他用户名。

导入的用户会获得其所属 catalog 中 `public` 数据库的完整访问权限
(`AclType::All`)，实际访问能力仍受全局权限的约束。

导入的账号只会创建一次。已有用户会被跳过，已删除的导入账号也不会在后续
启动时重新创建。之后你可以通过 UI 或 HTTP API 修改这些导入的用户。

## Catalog 范围

用户名在同一个 catalog 内唯一。`/v1/users` HTTP 用户管理 API 只列出和管理
请求当前 catalog 中的用户，默认 catalog 为 `greptime`。要选择其他 catalog，
可以通过 `db` 查询参数或 `x-greptime-db-name` 请求头传入 `tenant_a-public`
这样的值。创建用户时，请求体中的 `catalog` 字段不会改变目标 catalog。

HTTP、gRPC 和 PostgreSQL 身份验证会在选定的 catalog 中查找用户。
MySQL 密码身份验证和 admin-password CLI 仍在默认 catalog 中查找用户。

## 权限与 ACL

### 全局权限

权限包括以下操作：

| 权限 | 描述 |
| :--- | :--- |
| `TableCreate` | 创建新表 |
| `TableAlter` | 修改已有表 |
| `TableDrop` | 删除表 |
| `SqlSelect` | 执行 `SELECT` 查询 |
| `SqlInsert` | 执行 `INSERT` 操作 |
| `SqlDelete` | 执行 `DELETE` 操作 |
| `FlowCreate` | 创建 flow |
| `FlowDrop` | 删除 flow |
| `DatabaseCreate` | 创建数据库 |
| `DatabaseAlter` | 修改数据库 |
| `DatabaseDrop` | 删除数据库 |
| `Admin` | 完整管理权限 |
| `TriggerCreate` | 创建触发器 |
| `TriggerDrop` | 删除触发器 |
| `TriggerAlter` | 修改触发器 |

#### 预定义角色权限

使用密码文件导入账号时，预定义角色会映射到以下权限组合：

| 角色 | 权限 |
| :--- | :--- |
| `admin` | 所有权限 |
| `readonly` / `ro` | `SqlSelect` |
| `writeonly` / `wo` | `SqlInsert`, `SqlDelete`, `TableCreate`, `TableAlter`, `TableDrop`, `FlowCreate`, `FlowDrop`, `TriggerCreate`, `TriggerDrop`, `TriggerAlter`, `DatabaseCreate`, `DatabaseAlter`, `DatabaseDrop` |
| `readwrite` / `rw` | `readonly` + `writeonly` 权限 |

### 访问控制列表 (ACL)

ACL 控制数据库及其表的访问权限。在 HTTP API 中，`acl_map` 将数据库选择器
映射到表 ACL 条目列表。

#### 表 ACL

`all` ACL 授予对该数据库中所有表的访问权限。当用户需要读取或写入该
数据库中当前和未来的所有表时，可以使用该 ACL；实际访问能力仍受用户全局
权限的约束。

`match` ACL 通过精确表名授予对单个表的访问权限。当用户只应访问某个特定表，
且不应自动获得对其他相似表名的访问权限时，可以使用该 ACL。

`regex` ACL 授予对表名匹配正则表达式的表的访问权限。当表名遵循某种命名规则、
需要按组管理时，可以使用该 ACL。表名正则表达式默认匹配子串，不会自动限定为
完整名称。例如，`mem_.*` 也会匹配 `old_mem_usage`，`.*_metrics` 也会匹配
`cpu_metrics_backup`。请使用 `^mem_.*$` 匹配以 `mem_` 开头的表名，
使用 `^.*_metrics$` 匹配以 `_metrics` 结尾的表名，使用 `^sensor_[0-9]+$`
匹配 `sensor_1`、`sensor_2024` 这样的完整表名。

#### 数据库选择器

普通的 `acl_map` 键（例如 `public`）通过精确名称选择一个数据库。
带有保留前缀 `~regex:` 的键则通过正则表达式选择数据库：

```json
{
  "acl_map": {
    "~regex:tenant_[0-9]+": [{"type": "all"}]
  }
}
```

数据库正则表达式始终匹配完整名称。该示例授予对 `tenant_42` 中所有表的
访问权限，但不会匹配 `archive_tenant_42` 或 `tenant_42_backup`。
它适用于当前和未来所有名称匹配的数据库，与数据库的创建者无关。

如果精确选择器和正则选择器匹配同一个数据库，它们的表 ACL 条目会合并生效。
只要任一匹配的选择器包含 `all` 条目，用户就能访问该数据库中的所有表。
创建或更新用户时，无效的数据库或表正则表达式，以及空的数据库正则表达式，
都会被拒绝。

#### 数据库操作与系统表

拥有 `DatabaseCreate` 权限的非管理员用户可以在其所属 catalog 中创建数据库，
无需事先拥有目标数据库的 ACL。创建数据库时，系统会原子地为创建者授予对新
数据库的有效 `all` 访问权限，并刷新提交该请求的会话权限。数据库选择器不会
限制用户可以创建的数据库名称。`CREATE DATABASE IF NOT EXISTS` 不会为用户
授予对已有数据库的访问权限。

执行 `DROP DATABASE` 和 `COPY DATABASE` 时，除了相应的全局权限外，还必须
拥有目标数据库的有效 `all` 访问权限。对于普通数据库，`SHOW DATABASES`、
`SHOW TABLES`、`SHOW TABLE STATUS` 和 `SHOW VIEWS` 会根据用户的 ACL
过滤结果。

部分系统表有单独的访问规则。读取 catalog 范围内的 `information_schema`
表和 `information_schema.build_info` 需要 `SqlSelect` 权限，但不受表 ACL
限制。其他 `information_schema` 表需要 `Admin` 权限。

## 校验规则

### 用户名

用户名必须：

- 以字母开头（`a-z` 或 `A-Z`）
- 仅包含字母、数字和下划线
- 匹配 `[a-zA-Z][a-zA-Z0-9_]*` 模式

### 密码

密码校验规则取决于用户的创建或更新方式：

- 导入账号的密码不能为空。
- 通过 UI 或 HTTP API 创建或更新的本地密码长度必须为 6 到 64 个字符。
- LDAP 用户没有本地密码，其密码由 LDAP 管理。

## 外部身份验证

内置用户 Provider 支持在接收客户端请求的 standalone server 或 frontend
节点上配置以下可选的身份验证插件：

- **LDAP (`ldap_auth`)**：通过插件的 `config_file` 指定 LDAP 连接配置文件。
  使用 HTTP API 注册每个 LDAP 用户时，设置 `auth_source: "ldap"` 并省略
  `password`。密码由 LDAP 验证，权限和 ACL 来自存储的用户记录。
  仅有有效的 LDAP 凭据不会自动创建 GreptimeDB 用户。本地用户可以与 LDAP
  用户共存。
- **JWT (`jwt_auth`)**：配置受信任的验证密钥或 JWKS 端点。
  token 中的用户名声明（默认为 `sub`）必须对应选定 catalog 中的已有用户，
  存储的权限和 ACL 仍然生效。使用 HTTP 时，发送
  `Authorization: Bearer <token>` 请求头；使用 MySQL 和 PostgreSQL 时，
  将用户名设为 `*`，并将 JWT 作为密码。

## Enterprise Dashboard 中的用户管理

启用 `greptime_ee_user_provider` 后，GreptimeDB 和 Enterprise Dashboard 都要求
用户使用账号登录。下图展示了 Enterprise Dashboard 的登录页面：

<p align="center">
    <img src="/ent_user/login.png" alt="login page"/>
</p>

你可以使用导入文件中定义的账号登录；如果系统创建了后备 `admin` 账号，
也可以使用该账号登录。

只有拥有 `Admin` 权限的账号才能看到数据库管理菜单。非 admin 账号只能访问
查询页面，体验与开源版 dashboard 类似。

以 admin 用户登录后，点击左下角的 `User Management`，即可进入用户管理页面：

<p align="center">
    <img src="/ent_user/list.png" alt="login page"/>
</p>

该页面会列出当前 catalog 中的用户。你可以在此页面执行以下操作：

1. 创建用户
2. 更新已有用户
3. 删除用户

下图展示了创建用户的表单：

<p align="center">
    <img src="/ent_user/create.png" alt="login page"/>
</p>

在该表单中，你可以配置：

1. 用户名
2. 密码
3. 账号是否拥有 `Admin` 权限。非 admin 用户会被授予 `readwrite` 权限。
4. 账号的 ACL 列表

ACL 表单包含两个页签。你可以选择精确的表，也可以选择整个数据库来授予
全库访问权限，或者使用正则表达式为一组表授予访问权限。下图展示了正则表达式
表单：

<p align="center">
    <img src="/ent_user/regex.png" alt="login page"/>
</p>

## 参考

- **管理员账号**：账号导入完成后，只有当默认 catalog `greptime` 中没有拥有
  `Admin` 权限的用户，且用户名 `admin` 尚未被占用时，GreptimeDB 企业版才会
  创建后备 `admin` 账号。已有账号不会被覆盖。例如，上面的 `superuser:admin`
  条目会使系统跳过后备账号的创建。
  - 如果设置了环境变量 `GREPTIME_ENTERPRISE_ADMIN_PASSWORD`，则使用该变量的
    值作为后备账号的密码。在集群模式中，请在 Metasrv 进程上设置该变量；
    在单机模式中，请在 standalone 进程上设置。
  - 如果未设置该环境变量，则生成一个随机 UUID 作为密码。
- **查看自动生成的密码**：如果生成了随机密码，你可以在 GreptimeDB 日志文件中
  找到它。搜索类似如下的消息：
  ```text
  Created admin user with auto-generated password <UUID>
  ```
- **重置管理员密码**：你可以使用 CLI 重置默认 catalog 中已有本地 `admin`
  账号的密码。该命令从 Metasrv 配置文件中读取后端存储设置，并支持标准的
  `GREPTIMEDB_METASRV__...` 环境变量覆盖。
  ```shell
  ./greptime-ee cli user admin-password \
    --new-password <new-password> \
    --config-file /path/to/metasrv.toml
  ```
  该命令直接连接 etcd、MySQL 或 PostgreSQL，可在能够访问后端存储的任意
  主机上运行。请使用部署所用的 Metasrv 配置，确保其中的存储地址、元数据表、
  schema（如适用）和键前缀与部署一致。
  该命令不支持 standalone 默认使用的 Raft Engine 后端。对于使用 MySQL 或
  PostgreSQL 元数据存储的 standalone 部署，需要另外准备一份指向相同存储的
  Metasrv 格式配置文件，不能直接传入 standalone 配置文件。该命令不会创建
  缺失的 `admin` 账号，也不会重置 LDAP 密码。
- **持久化**：在集群模式中，用户信息持久化在 Metasrv 的 KV 存储中，并在
  frontend 节点之间共享。在单机模式中，用户信息持久化在 standalone 的元数据
  后端，默认后端为 Raft Engine。
- **Admin 保护**：内置的 `admin` 用户不能通过 API 删除。
