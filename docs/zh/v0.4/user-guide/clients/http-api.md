# HTTP API

## 鉴权

GreptimeDB 支持 HTTP API 内置的 `Basic` 鉴权机制，接收 **SQL** 语言和 **OpenTSDB** 协议语言。按照下面的步骤来设置鉴权：

1. 使用 `Base64` 算法编码你的用户名和密码。
2. 在 HTTP 请求头中写入编码后的鉴权信息：`Authorization: Basic <base64-encoded-credentials>`

示例如下：

```shell
curl -X POST \
-H 'Authorization: Basic Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'sql=show tables' \
http://localhost:4000/v1/sql?db=public
```

```json
{
  "code": 0,
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "Tables",
              "data_type": "String"
            }
          ]
        },
        "rows": [
          ["numbers"]
        ]
      }
    }
  ],
  "execution_time_ms": 1
}
```

* `Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=` 是 `greptime_user:greptime_pwd` 使用 `Base64` 编码后的结果，请记得替换为你自己的用户名和密码使用 `Base64` 编码后的字符串。
* URL 中的 `public` 是数据库的名称，在鉴权时必须提供。

::: tip 注意
InfluxDB 使用自己的鉴权格式，详情请参考 [InfluxDB](./influxdb-line.md)。
:::

## 写入数据

- [SQL](../write-data/sql.md)
- [OpenTSDB](../write-data/opentsdb.md)

## 读取数据

- [SQL](../query-data/sql.md)
