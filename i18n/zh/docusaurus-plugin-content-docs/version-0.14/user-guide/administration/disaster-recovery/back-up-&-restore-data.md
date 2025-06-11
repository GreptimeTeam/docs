---
keywords: [备份, 恢复, 导出工具, 导入工具, 数据库备份, 数据恢复, 命令行工具, 使用场景, 最佳实践]
description: 介绍 GreptimeDB 的导出和导入工具，用于数据库备份和恢复，包括命令语法、选项、常见使用场景、最佳实践和故障排除等内容。
---

# GreptimeDB 导出和导入工具

本指南描述了如何使用 GreptimeDB 的导出和导入工具进行数据库备份和恢复。

导出和导入工具提供了备份和恢复 GreptimeDB 数据库的功能。这些工具可以处理 schema（表结构等）和数据，支持完整或选择性的备份和恢复操作。

## 导出工具

:::warning Note
为了更好的组织命令行工具，从 v0.14.4 开始，此命令已被移动到 `greptime cli data export`。命令行参数保持不变。
:::

### 命令语法
```bash
greptime cli export [OPTIONS]
```

### 选项
| 选项 | 是否必需 | 默认值 | 描述 |
|--------|----------|---------|-------------|
| --addr | 是 | - | 要连接的 GreptimeDB 数据库地址 |
| --output-dir | 是 | - | 存储导出数据的目录 |
| --database | 否 | 所有数据库 | 要导出的数据库名称 |
| --export-jobs, -j | 否 | 1 | 并行导出任务数量（多个数据库可以并行导出） |
| --max-retry | 否 | 3 | 每个任务的最大重试次数 |
| --target, -t | 否 | all | 导出目标（schema/data/all） |
| --start-time | 否 | - | 数据导出的开始时间范围 |
| --end-time | 否 | - | 数据导出的结束时间范围 |
| --auth-basic | 否 | - | 使用 `<username>:<password>` 格式 |
| --timeout | 否 | 0 | 对 DB 进行一次调用的超时时间，默认为 0 代表永不超时（例如 `30s`, `10min 20s`） |

### 导出目标
- `schema`: 仅导出表结构（`SHOW CREATE TABLE`）
- `data`: 仅导出表数据（`COPY DATABASE TO`）
- `all`: 导出表结构和数据（默认）

### 输出目录结构
```
<output-dir>/
└── greptime/
    └── <database>/
        ├── create_database.sql
        ├── create_tables.sql
        ├── copy_from.sql
        └── <数据文件>
```

## 导入工具

:::warning Note
为了更好的组织命令行工具，从 v0.14.4 开始，此命令已被移动到 `greptime cli data import`。命令行参数保持不变。
:::

### 命令语法
```bash
greptime cli import [OPTIONS]
```

### 选项
| 选项 | 是否必需 | 默认值 | 描述 |
|--------|----------|---------|-------------|
| --addr | 是 | - | 要连接的 GreptimeDB 数据库地址 |
| --input-dir | 是 | - | 包含备份数据的目录 |
| --database | 否 | 所有数据库 | 要导入的数据库名称 |
| --import-jobs, -j | 否 | 1 | 并行导入任务数量（多个数据库可以并行导入） |
| --max-retry | 否 | 3 | 每个任务的最大重试次数 |
| --target, -t | 否 | all | 导入目标（schema/data/all） |
| --auth-basic | 否 | - | 使用 `<username>:<password>` 格式 |

### 导入目标
- `schema`: 仅导入表结构
- `data`: 仅导入表数据
- `all`: 导入表结构和数据（默认）

## 常见使用场景

### 完整数据库备份
```bash
# 导出所有数据库备份
greptime cli export --addr localhost:4000 --output-dir /tmp/backup/greptimedb

# 导入所有数据库
greptime cli import --addr localhost:4000 --input-dir /tmp/backup/greptimedb
```

### 仅表结构操作
```bash
# 仅导出表结构
greptime cli export --addr localhost:4000 --output-dir /tmp/backup/schemas --target schema

# 仅导入表结构
greptime cli import --addr localhost:4000 --input-dir /tmp/backup/schemas --target schema
```

### 基于时间范围的备份
```bash
# 导出特定时间范围内的数据
greptime cli export --addr localhost:4000 \
    --output-dir /tmp/backup/timerange \
    --start-time "2024-01-01 00:00:00" \
    --end-time "2024-01-31 23:59:59"
```

### 指定数据库备份
```bash
# 导出指定数据库
greptime cli export --addr localhost:4000 --output-dir /tmp/backup/greptimedb --database '{my_database_name}'

# 导入工具也同样适用
greptime cli import --addr localhost:4000 --input-dir /tmp/backup/greptimedb --database '{my_database_name}'
```

## 最佳实践

1. **并行度配置**
   - 根据可用系统资源调整 `--export-jobs`/`--import-jobs`
   - 从较低的值开始，逐步增加
   - 在操作期间监控系统性能

2. **备份策略**
   - 使用时间范围进行增量数据备份
   - 定期备份用于灾难恢复

3. **错误处理**
   - 使用 `--max-retry` 处理临时异常
   - 保留日志以便故障排除

## 故障排除

### 常见问题

1. **连接错误**
   - 验证服务器地址和端口
   - 检查网络连接
   - 确保身份验证凭据正确

2. **权限问题**
   - 验证输出/输入目录的读写权限

3. **资源限制**
   - 减少并行任务数
   - 确保足够的磁盘空间
   - 在操作期间监控系统资源

### 性能提示

1. **导出性能**
   - 对大型数据集使用时间范围
   - 根据 CPU/内存调整并行任务数量
   - 考虑网络带宽限制

2. **导入性能**
   - 注意监控数据库资源

1. **导出性能**
   - 对大型数据集使用时间范围
   - 根据 CPU/内存调整并行任务
   - 考虑网络带宽限制

2. **导入性能**
   - 监控数据库资源
