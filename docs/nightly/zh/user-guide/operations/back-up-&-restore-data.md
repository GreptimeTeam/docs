# 备份和恢复数据

使用 [`COPY` 命令](/reference/sql/copy.md) 来备份和恢复数据。

## 备份表

将表 `monitor` 以 `parquet` 格式备份到文件 `/home/backup/monitor/monitor.parquet`：

```sql
COPY monitor TO '/home/backup/monitor/monitor.parquet' WITH (FORMAT = 'parquet');
```

备份指定时间范围内的数据：

```sql
COPY monitor TO '/home/backup/monitor/monitor_20240518.parquet' WITH (FORMAT = 'parquet', START_TIME='2024-05-18 00:00:00', END_TIME='2025-05-19 00:00:00');
```

上述命令将导出 `2024-05-19` 的数据。可以使用此命令实现增量备份。

## 恢复表

恢复 `monitor` 表：

```sql
COPY monitor FROM '/home/backup/monitor/monitor.parquet' WITH (FORMAT = 'parquet');
```

如果每次增量导出数据，所有文件在同一文件夹下但文件名不同，可以使用 `PATTERN` 选项选中并恢复它们：

```sql
COPY monitor FROM '/home/backup/monitor/' WITH (FORMAT = 'parquet', PATTERN = '.*parquet');
```

## 备份和恢复数据库

和表的命令类似：

```sql
-- 备份数据库 public --
COPY DATABASE public TO '/home/backup/public/' WITH (FORMAT='parquet');

-- 恢复数据库 public --
COPY DATABASE public FROM '/home/backup/public/' WITH (FORMAT='parquet');
```

导出后，查看文件夹 `/home/backup/public/`，该命令将每个表导出为单独的文件。