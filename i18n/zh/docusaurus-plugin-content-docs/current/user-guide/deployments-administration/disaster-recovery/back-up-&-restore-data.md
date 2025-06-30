---
keywords: [备份, 恢复, 导出工具, 导入工具, 数据库备份, 数据恢复, 命令行工具, 使用场景, 最佳实践]
description: 介绍 GreptimeDB 的导出和导入工具，用于数据库备份和恢复，包括命令语法、选项、常见使用场景、最佳实践和故障排除等内容。
---

# GreptimeDB 导出和导入工具

本指南描述了如何使用 GreptimeDB 的导出和导入工具进行数据库备份和恢复。

有关详细的命令行选项和高级配置，请参阅 [数据导出和导入](/reference/command-lines/utilities/data.md)。

## 概述

## 导出操作

### 完整数据库备份
导出所有数据库备份。此操作将每个数据库导出到单个目录中，包括所有表及其数据。输出目录结构如下：
```bash
# 导出所有数据库备份
greptime cli data export \
    --addr localhost:4000 \
    --output-dir /tmp/backup/greptimedb
```
输出目录结构：
```
<output-dir>/
└── greptime/
    └── <database>/
        ├── create_database.sql
        ├── create_tables.sql
        ├── copy_from.sql
        └── <数据文件>
```

#### 导出到 S3

导出所有数据库备份到 S3:
```bash
greptime cli data export \
    --addr localhost:4000 \
    --s3 \
    --s3-bucket <YOUR_S3_BUCKET> \
    --s3-access-key <YOUR_S3_ACCESS_KEY> \
    --s3-secret-key <YOUR_S3_SECRET_KEY> \
    --s3-region <YOUR_S3_REGION> \
    --s3-root <YOUR_S3_ROOT> \
    --s3-endpoint <YOUR_S3_ENDPOINT> 
```

### 仅导出表结构
仅导出表结构而不包含数据。此操作将 `CREATE TABLE` 语句导出到 SQL 文件中，允许您备份表结构而不包含实际数据。
```bash
# 仅导出表结构
greptime cli data export \
    --addr localhost:4000 \
    --output-dir /tmp/backup/schemas \
    --target schema
```

### 基于时间范围备份
```bash
# 导出指定时间范围内的数据
greptime cli data export --addr localhost:4000 \
    --output-dir /tmp/backup/timerange \
    --start-time "2024-01-01 00:00:00" \
    --end-time "2024-01-31 23:59:59"
```

### 指定数据库备份
```bash
# 导出指定数据库
greptime cli data export \
    --addr localhost:4000 \
    --output-dir /tmp/backup/greptimedb \
    --database '{my_database_name}'
```

## 导入操作

### 完整数据库备份
导入所有数据库备份。
```bash
# 导入所有数据库
greptime cli data import \
    --addr localhost:4000 \
    --input-dir /tmp/backup/greptimedb
```

### 仅导入表结构
仅导入表结构而不包含数据。此操作将 `CREATE TABLE` 语句从 SQL 文件中导入，允许您恢复表结构而不包含实际数据。
```bash
# 仅导入表结构
greptime cli data import \
    --addr localhost:4000 \
    --input-dir /tmp/backup/schemas \
    --target schema
```

### 指定数据库备份
```bash
# 导入指定数据库
greptime cli data import \
    --addr localhost:4000 \
    --input-dir /tmp/backup/greptimedb \
    --database '{my_database_name}'
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

## 性能提示

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

