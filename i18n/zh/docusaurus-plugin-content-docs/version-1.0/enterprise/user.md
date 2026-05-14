---
keywords: [用户, 权限, GreptimeDB 企业版, RBAC, ACL, 身份验证]
description: GreptimeDB 用户与权限机制概述。
---

# 内置用户管理

GreptimeDB 企业版提供了由 Metasrv 支持的内置用户与权限系统。它支持
基于角色的访问控制 (RBAC) 和细粒度访问控制列表 (ACL)，用于保障数据
安全与隔离。

## 主要特性

- **内置用户管理**：用户账号和权限存储在 Metasrv 中，确保整个集群中的
  管理保持一致。
- **基于角色的访问控制 (RBAC)**：为用户分配全局权限，控制 `SELECT`、
  `INSERT`、`CREATE TABLE` 等操作。
- **细粒度 ACL**：使用精确匹配或正则表达式控制特定数据库内的表级访问。
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
`<username>[:<role>]=<password>`

可用角色：

- `admin`：拥有完整权限，包括用户管理权限。
- `readonly`（或 `ro`）：只读访问权限 (`SqlSelect`)。
- `writeonly`（或 `wo`）：只写访问权限，例如 `SqlInsert`、`TableCreate`。
- `readwrite`（或 `rw`）：同时拥有读写访问权限（默认）。

`passwords.txt` 示例：

```text
# username[:role]=password
superuser:admin=strong_password
alice:ro=alice_pwd
bob:rw=bob_pwd
```

默认情况下，导入的用户会获得 `public` 数据库的完整访问权限
(`AclType::All`)。

导入的账号只会创建一次。如果后续启动时发现某个导入用户已经存在，则会跳过
该用户。之后你可以通过 UI 修改这些导入的用户。

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

ACL 在数据库内提供表级安全控制。每条 ACL 都限定在某个数据库中，并控制
用户可以访问该数据库中的哪些表。

`all` ACL 授予对该数据库中所有表的访问权限。当用户需要读取或写入该
数据库中当前和未来的所有表时，可以使用该 ACL；实际访问能力仍受用户全局
权限的约束。

`match` ACL 通过精确表名授予对单个表的访问权限。当用户只应访问某个特定表，
且不应自动获得对其他相似表名的访问权限时，可以使用该 ACL。

`regex` ACL 授予对表名匹配正则表达式的表的访问权限。当表名遵循某种命名规则、
需要按组管理时，可以使用该 ACL。例如，`mem_.*` 匹配以 `mem_` 开头的表名，
`.*_metrics` 匹配以 `_metrics` 结尾的表名，`sensor_[0-9]+` 匹配
`sensor_1`、`sensor_2024` 等表名。Regex ACL 会在配置的数据库内对表名
进行匹配，因此请尽量使用明确的模式，避免授予超出预期的表访问权限。

## 校验规则

### 用户名

用户名必须：

- 以字母开头（`a-z` 或 `A-Z`）
- 仅包含字母、数字和下划线
- 匹配 `[a-zA-Z][a-zA-Z0-9_]*` 模式

### 密码

密码校验规则取决于用户的创建或更新方式：

- 导入账号的密码不能为空。
- 通过 UI 创建或更新的密码长度必须为 6 到 64 个字符。

## Enterprise Dashboard 中的用户管理

启用 `greptime_ee_user_provider` 后，GreptimeDB 和 Enterprise Dashboard 都要求
用户使用账号登录。下图展示了 Enterprise Dashboard 的登录页面：

<p align="center">
    <img src="/ent_user/login.jpeg" alt="login page"/>
</p>

你可以使用自动创建的 admin 账号，或使用导入文件中定义的账号登录。

只有拥有 `Admin` 权限的账号才能看到数据库管理菜单。非 admin 账号只能访问
查询页面，体验与开源版 dashboard 类似。

以 admin 用户登录后，点击左下角的 `User Management`，即可进入用户管理页面：

<p align="center">
    <img src="/ent_user/list.png" alt="login page"/>
</p>

该页面会列出所有当前用户。你可以在此页面执行以下操作：

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

- **管理员账号**：系统首次启动时，如果默认 `admin` 账号尚不存在，
  GreptimeDB 企业版会自动创建该账号。
  - 如果设置了环境变量 `GREPTIME_ENTERPRISE_ADMIN_PASSWORD`，则使用该变量的
    值作为密码。
  - 如果未设置该环境变量，则生成一个随机 UUID 作为密码。
- **查看自动生成的密码**：如果生成了随机密码，你可以在 GreptimeDB 日志文件中
  找到它。搜索类似如下的消息：
  ```text
  Created admin user with auto-generated password <UUID>
  ```
- **重置管理员密码**：你可以使用 CLI 重置 `admin` 密码，无需手动编辑 KV 存储。
  该命令从 Metasrv 配置文件中读取后端存储设置，并支持标准的
  `GREPTIMEDB_METASRV__...` 环境变量覆盖。
  ```shell
  ./greptime-ee cli user admin-password \
    --new-password <new-password> \
    --config-file /path/to/metasrv.toml
  ```
  此命令必须在 Metasrv 实例上执行。`--config-file` 应指向你的 Metasrv（或
  standalone）部署所使用的同一 Metasrv 配置文件，以便 CLI 能够定位正确的后端
  存储（etcd、MySQL 或 PostgreSQL）。
- **持久化**：用户信息会持久化在 Metasrv 的 KV 存储中，因此集群中的所有
  frontend 节点都可以访问这些用户信息。
- **Admin 保护**：内置的 `admin` 用户不能通过 API 删除。
