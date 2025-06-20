---
keywords: [GreptimeDB CLI, backup, restore, export tool, import tool, database backup, database restoration, command line tool, data export, data import]
description: Introduction to GreptimeDB's data export and import tools for backing up and restoring database data, including command syntax, options.
---

# Data Export & Import

The Export and Import tools provide functionality for backing up and restoring GreptimeDB databases. These tools can handle both schema and data, allowing for complete or selective backup and restoration operations.

## Export Tool

### Command Syntax
```bash
greptime cli data export [OPTIONS]
```

### Options
| Option            | Required | Default        | Description                                                                                                |
| ----------------- | -------- | -------------- | ---------------------------------------------------------------------------------------------------------- |
| --addr            | Yes      | -              | Server address to connect                                                                                  |
| --output-dir      | Yes      | -              | Directory to store exported data                                                                           |
| --database        | No       | all databasses | Name of the database to export                                                                             |
| --export-jobs, -j | No       | 1              | Number of parallel export jobs(multiple databases can be exported in parallel)                             |
| --max-retry       | No       | 3              | Maximum retry attempts per job                                                                             |
| --target, -t      | No       | all            | Export target (schema/data/all)                                                                            |
| --start-time      | No       | -              | Start of time range for data export                                                                        |
| --end-time        | No       | -              | End of time range for data export                                                                          |
| --auth-basic      | No       | -              | Use the `<username>:<password>` format                                                                     |
| --timeout         | No       | 0              | The timeout for a single call to the DB, default is 0 which means never timeout (e.g., `30s`, `10min 20s`) |

### Export Targets
- `schema`: Exports table schemas only (`SHOW CREATE TABLE`)
- `data`: Exports table data only (`COPY DATABASE TO`)
- `all`: Exports both schemas and data (default)

## Import Tool

### Command Syntax
```bash
greptime cli data import [OPTIONS]
```

### Options
| Option            | Required | Default       | Description                                                                     |
| ----------------- | -------- | ------------- | ------------------------------------------------------------------------------- |
| --addr            | Yes      | -             | Server address to connect                                                       |
| --input-dir       | Yes      | -             | Directory containing backup data                                                |
| --database        | No       | all databases | Name of the database to import                                                  |
| --import-jobs, -j | No       | 1             | Number of parallel import jobs (multiple databases can be imported in parallel) |
| --max-retry       | No       | 3             | Maximum retry attempts per job                                                  |
| --target, -t      | No       | all           | Import target (schema/data/all)                                                 |
| --auth-basic      | No       | -             | Use the `<username>:<password>` format                                          |

### Import Targets
- `schema`: Imports table schemas only
- `data`: Imports table data only
- `all`: Imports both schemas and data (default)
