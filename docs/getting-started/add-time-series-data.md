# Add Time-Series Data

## Introduction

After creating the table, you can populate it in various ways:

- `INSERT` statement
- [InfluxDB line protocol][1]
- [OpenTSDB line protocol][2]

[1]: https://docs.influxdata.com/influxdb/v1.8/write_protocols/line_protocol_tutorial/
[2]: http://opentsdb.net/docs/build/html/user_guide/writing/index.html

## `INSERT` Statement

Using the `INSERT` statement is an easy way to add data to your table.

``` sql
INSERT INTO system_metrics
VALUES
    ("host1", "idc_a", 11.8, 10.3, 10.3, 1667446797450),
    ("host2", "idc_a", 80.1, 70.3, 90.0, 1667446797450),
    ("host1", "idc_b", 50.0, 66.7, 40.6, 1667446797450);
```

Through the above statement, we have inserted three rows into the `system_metrics` table.

For more information about the `INSERT` statement, please refer to the SQL reference document.

## InfluxDB Line Protocol

GreptimeDB supports HTTP InfluxDB line protocol. For more information, please refer to the Configuration reference.

> Note: Please start the frontend instance to use the InfluxDB protocol to write data.

You can write data via /influxdb/write API:

```shell
curl -i -XPOST "http://localhost:4000/v1/influxdb/write?db=public&precision=ms" \
--data-binary \
'system_metrics,host=host1,idc=idc_a cpu_util=11.8,memory_util=10.3,disk_util=10.3 1667446797450
 system_metrics,host=host2,idc=idc_a cpu_util=80.1,memory_util=70.3,disk_util=90.0 1667446797450
 system_metrics,host=host1,idc=idc_b cpu_util=50.0,memory_util=66.7,disk_util=40.6 1667446797450'
```

## OpenTSDB Line Protocol

GreptimeDB supports ingesting OpenTSDB lines via Telnet or HTTP API, please refer to
our [user guide](../user-guide/supported-protocols/opentsdb.md) for more details.
