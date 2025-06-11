---
keywords: [backup and restore, GreptimeDB, export tool, import tool, database backup, database restoration, command syntax, best practices]
description: Describes how to use GreptimeDB's Export and Import tools for database backup and restoration, including command syntax, options, usage scenarios, best practices, troubleshooting, and performance tips.
---

# GreptimeDB Export & Import Tools

This guide describes how to use GreptimeDB's Export and Import tools for database backup and restoration.


The Export and Import tools provide functionality for backing up and restoring GreptimeDB databases. These tools can handle both schema and data, allowing for complete or selective backup and restoration operations.

## Export Tool

:::warning Note
To better organize the command-line tools, this command has been moved to `greptime cli data export` since v0.14.4. The command-line parameters remain unchanged.
:::

### Command Syntax
```bash
greptime cli export [OPTIONS]
```

### Options
| Option | Required | Default | Description |
|--------|----------|---------|-------------|
| --addr | Yes | - | Server address to connect |
| --output-dir | Yes | - | Directory to store exported data |
| --database | No | all databasses | Name of the database to export |
| --export-jobs, -j | No | 1 | Number of parallel export jobs(multiple databases can be exported in parallel) |
| --max-retry | No | 3 | Maximum retry attempts per job |
| --target, -t | No | all | Export target (schema/data/all) |
| --start-time | No | - | Start of time range for data export |
| --end-time | No | - | End of time range for data export |
| --auth-basic | No | - | Use the `<username>:<password>` format |
| --timeout | No | 0 | The timeout for a single call to the DB, default is 0 which means never timeout (e.g., `30s`, `10min 20s`) |

### Export Targets
- `schema`: Exports table schemas only (`SHOW CREATE TABLE`)
- `data`: Exports table data only (`COPY DATABASE TO`)
- `all`: Exports both schemas and data (default)

### Output Directory Structure
```
<output-dir>/
└── greptime/
    └── <database>/
        ├── create_database.sql
        ├── create_tables.sql
        ├── copy_from.sql
        └── <data files>
```

## Import Tool

:::warning Note
To better organize the command-line tools, this command has been moved to `greptime cli data import` since v0.14.4. The command-line parameters remain unchanged.
:::

### Command Syntax
```bash
greptime cli import [OPTIONS]
```

### Options
| Option | Required | Default | Description |
|--------|----------|---------|-------------|
| --addr | Yes | - | Server address to connect |
| --input-dir | Yes | - | Directory containing backup data |
| --database | No | all databases | Name of the database to import |
| --import-jobs, -j | No | 1 | Number of parallel import jobs (multiple databases can be imported in parallel) |
| --max-retry | No | 3 | Maximum retry attempts per job |
| --target, -t | No | all | Import target (schema/data/all) |
| --auth-basic | No | - | Use the `<username>:<password>` format |

### Import Targets
- `schema`: Imports table schemas only
- `data`: Imports table data only
- `all`: Imports both schemas and data (default)

## Common Usage Scenarios

### Full Databases Backup
```bash
# Export all databases backup
greptime cli export --addr localhost:4000 --output-dir /tmp/backup/greptimedb

# Import all databases
greptime cli import --addr localhost:4000 --input-dir /tmp/backup/greptimedb
```

### Schema-Only Operations
```bash
# Export only schemas
greptime cli export --addr localhost:4000 --output-dir /tmp/backup/schemas --target schema

# Import only schemas
greptime cli import --addr localhost:4000 --input-dir /tmp/backup/schemas --target schema
```

### Time-Range Based Backup
```bash
# Export data within specific time range
greptime cli export --addr localhost:4000 \
    --output-dir /tmp/backup/timerange \
    --start-time "2024-01-01 00:00:00" \
    --end-time "2024-01-31 23:59:59"
```

### Specific Database Backup
```bash
# To export a specific database
greptime cli export --addr localhost:4000 --output-dir /tmp/backup/greptimedb --database '{my_database_name}'

# The same applies to import tool
greptime cli import --addr localhost:4000 --input-dir /tmp/backup/greptimedb --database '{my_database_name}'
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

## Troubleshooting

### Common Issues

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

### Performance Tips

1. **Export Performance**
   - Use time ranges for large datasets
   - Adjust parallel jobs based on CPU/memory
   - Consider network bandwidth limitations

2. **Import Performance**
   - Monitor database resources
