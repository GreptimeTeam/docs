---
keywords: [backup and restore, GreptimeDB, export tool, import tool, database backup, database restoration, command syntax, best practices]
description: Describes how to use GreptimeDB's Export and Import tools for database backup and restoration, including command syntax, options, usage scenarios, best practices, troubleshooting, and performance tips.
---

# Data Export & Import

This guide describes how to use GreptimeDB's Export and Import tools for database data backup and restoration operations. 

For detailed command-line options and advanced configurations, please refer to [Data Export & Import](/reference/command-lines/utilities/data.md).

## Overview

## Export Operations

### Full Databases Backup
Export all databases backup. This operation exports each database into a single directory, including all tables and their data. 
```bash
# Export all databases backup
greptime cli data export \
    --addr localhost:4000 \
    --output-dir /tmp/backup/greptimedb
```
The output directory structure is as follows:
```
<output-dir>/
└── greptime/
    └── <database>/
        ├── create_database.sql
        ├── create_tables.sql
        ├── copy_from.sql
        └── <data files>
```

### Schema-Only Operations
Export only schemas without data. This operation exports `CREATE TABLE` statements into SQL files, allowing you to backup table structures without the actual data.
```bash
# Export only schemas
greptime cli data export \
    --addr localhost:4000 \
    --output-dir /tmp/backup/schemas \
    --target schema
```

### Time-Range Based Backup
```bash
# Export data within specific time range
greptime cli data export --addr localhost:4000 \
    --output-dir /tmp/backup/timerange \
    --start-time "2024-01-01 00:00:00" \
    --end-time "2024-01-31 23:59:59"
```

### Specific Database Backup
```bash
# To export a specific database
greptime cli data export \
    --addr localhost:4000 \
    --output-dir /tmp/backup/greptimedb \
    --database '{my_database_name}'
```

## Import Operations

### Full Databases Backup
Import all databases backup.
```bash
# Import all databases
greptime cli data import \
    --addr localhost:4000 \
    --input-dir /tmp/backup/greptimedb
```

### Schema-Only Operations
Import only schemas without data. This operation imports `CREATE TABLE` statements from SQL files, allowing you to restore table structures without the actual data.
```bash
# Import only schemas
greptime cli data import \
    --addr localhost:4000 \
    --input-dir /tmp/backup/schemas \
    --target schema
```

### Specific Database Backup
```bash
# The same applies to import tool
greptime cli data import \
    --addr localhost:4000 \
    --input-dir /tmp/backup/greptimedb \
    --database '{my_database_name}'
```

## Best Practices

1. **Parallelism Configuration**
   - Adjust `--export-jobs`/`--import-jobs` based on available system resources
   - Start with a lower value and increase gradually
   - Monitor system performance during operations

2. **Backup Strategy**
   - Incremental data backups using time ranges
   - Periodic backups for disaster recovery

3. **Error Handling**
   - Use `--max-retry` for handling transient failures
   - Keep logs for troubleshooting

## Performance Tips

1. **Export Performance**
   - Use time ranges for large datasets
   - Adjust parallel jobs based on CPU/memory
   - Consider network bandwidth limitations

2. **Import Performance**
   - Monitor database resources

## Troubleshooting

1. **Connection Errors**
   - Verify server address and port
   - Check network connectivity
   - Ensure authentication credentials are correct

2. **Permission Issues**
   - Verify read/write permissions on output/input directories

3. **Resource Constraints**
   - Reduce parallel jobs
   - Ensure sufficient disk space
   - Monitor system resources during operations

