# 写入数据

## 插入新数据

用户也可以通过 `sql` API 插入数据

```python
from greptime import query
@copr(returns=["affected_rows"])
def insert() -> vector[i32]:
    return query().sql("insert into monitor(host, ts, cpu, memory) values('localhost',1667446807000, 15.3, 66.6)")
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
              "name": "rows",
              "data_type": "Int32"
            }
          ]
        },
        "rows": [
          [
            1
          ]
        ]
      }
    }
  ],
  "execution_time_ms": 4
}
```
