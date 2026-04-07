# 查询数据

我们在 Python Corpcessor 中提供了两种方法来轻松查询 GreptimeDB 的数据：

* SQL：运行一个 SQL 字符串并返回查询结果。
* DataFrame API：描述和执行查询的内置模块，类似于 [Pandas DataFrame](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.html) 或 [Spark DataFrame](https://spark.apache.org/docs/latest/sql-programming-guide.html)。

## SQL

使用 `greptime` 模块的 `query` 方法来检索一个查询引擎，然后调用 `sql` 函数来执行一个 SQL 字符串，比如：

```python
@copr(returns=["value"])
def query_numbers()->vector[f64]:
    from greptime import query
    return query().sql("select number from numbers limit 10")[0]
```

通过 SQL 客户端调用它：

```sql
SQL > select query_numbers();
+-----------------+
| query_numbers() |
+-----------------+
|               0 |
|               1 |
|               2 |
|               3 |
|               4 |
|               5 |
|               6 |
|               7 |
|               8 |
|               9 |
+-----------------+
10 rows in set (1.78 sec)
```

 `sql` 函数返回一个列的列表，每个列是一个值的向量。

在上面的例子中，`sql("select number from numbers limit 10")` 返回一个向量的列表。并使用 `[0]` 检索第一列向量，这就是 `select` SQL 中的 `number` 列。

## 查询后处理

在查询结果返回给用户之前进行处理时，协处理器就能派上用场。

例如，我们想对数值进行标准化处理：

* 如果错过了，返回 0，而不是 null 或 `NaN`，
* 如果它大于 5，返回 5，
* 如果它小于 0，则返回 0。

然后我们可以创建 `normalize.py`:

```python
import math

def normalize0(x):
    if x is None or math.isnan(x):
        return 0
    elif x > 5:
        return 5
    elif x < 0:
        return 0
    else:
        return x

@coprocessor(args=["number"], sql="select number from numbers limit 10", returns=["value"])
def normalize(v) -> vector[i64]:
    return [normalize0(x) for x in v]
```

`normalize0` 函数的行为如上所述。而 `normalize` 函数是协处理器的入口点：

* 执行 SQL 的 `select value from demo`，
* 提取查询结果中的列 `value` 并将其作为 `normalize` 函数的参数，然后调用该函数。
* 在函数中，使用列表理解来处理 `value` 向量，通过 `normalize0` 函数处理每个元素，
* 返回以 `value` 列命名的结果。

`->vector[i64]` 部分指定了用于生成输出模式的返回列类型。

这个例子还展示了如何导入 stdlib 和定义其他函数（`normalize0`）进行调用。
`normalize` 协处理器将在流中被调用，查询结果可能包含多个批次，引擎将对每个批次调用协处理器。而且应该记住，从查询结果中提取的列都是向量，我们将在下一章中介绍向量。

提交并运行这个脚本将产生输出：

```json
{
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "value",
              "data_type": "Int64"
            }
          ]
        },
        "rows": [
          [0],
          [1],
          [2],
          [3],
          [4],
          [5],
          [5],
          [5],
          [5],
          [5]
        ]
      }
    }
  ]
}
```
