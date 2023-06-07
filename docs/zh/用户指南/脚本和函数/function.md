# Function

## 协处理器注释

`@coprocesssor` 注释指定一个 python 函数作为 GreptimeDB 的协处理器，并为其设置一些属性。

该引擎允许一个且仅有一个用 `@coprocesssor` 注释的函数，不能在一个脚本中拥有一个以上的协处理器。

| Parameter | Description | Example |
| --- | --- | --- |
| `sql` | Optional. The SQL statement that the coprocessor function will query data from the database and assign them to input `args`. | `@copr(sql="select * from cpu", ..)` |
| `args` | Optional. The argument names that the coprocessor function will be taken as input, which are the columns in query results by `sql`. | `@copr(args=["cpu", "mem"], ..)` |
| `returns` | The column names that the coprocessor function will return. The Coprocessor Engine uses it to generate the output schema. | `@copr(returns=["add", "sub", "mul", "div"], ..)` |
| `backend` | Optional. The coprocessor function will run on available engines like `rspy` and `pyo3`, which are associated with `RustPython` Backend and `CPython` Backend respectively. The default engine is set to `rspy`.  | `@copr(backend="rspy", ..)` |

`sql` 和 `args` 都是可选的；它们必须都可用，或都不可用，并通常在后查询处理中被使用，详情请阅读下文。

`returns` 是每个 coprocessor 都需要的，因为输出模式必然存在。

 因为 `RustPython` 不能支持 C 语言 API，当尝试使用 `pyo3` 后端来使用只支持 C 语言 API 的第三方 python 库时，例如 `numpy`，`pandas` 等，`backend` 则是必要的。

## 协处理器函数的输入

该协处理器也接受之前已经看到的参数：
```python
@coprocessor(args=["number"], sql="select number from numbers limit 20", returns=["value"])
def normalize(v) -> vector[i64]:
    return [normalize0(x) for x in v]
```

参数 `v` 是执行 `sql` 返回的查询结果中的 `number` 列（由 `args` 属性指定）。

当然，也可以有多个参数：
```python
@coprocessor(args=["number", "number", "number"],
             sql="select number from numbers limit 5",
             returns=["value"])
def normalize(n1, n2, n3) -> vector[i64]:
    # returns [0,1,8,27,64]
    return n1 * n2 * n3
```

除了 `args`，还可以向协处理器传递用户定义的参数：
```python
@coprocessor(returns=['value'])
def add(**params) -> vector[i64]:
    a = params['a']
    b = params['b']
    return int(a) + int(b)
```

然后从 HTTP API 传递 `a` 和 `b`：

```sh
curl  -XPOST \
   "http://localhost:4000/v1/run-script?name=add&db=public&a=42&b=99"
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
              "name": "value",
              "data_type": "Int64"
            }
          ]
        },
        "rows": [
          [
            141
          ]
        ]
      }
    }
  ],
  "execution_time_ms": 0
}
```

将 `a=42&b=99` 作为查询参数传入HTTP API，返回结果 `141`。

用户定义的参数必须由协处理器中的 `**kwargs` 来完成，其类型都是字符串。可以传递任何想要的东西，如在协处理器中运行的 SQL。


## 协处理器函数的输出

正如前面的例子所展示的那样，协处理器函数的输出必须是向量。

We can return multi vectors:
```python
from greptime import vector

@coprocessor(returns=["a", "b", "c"])
def return_vectors() -> (vector[i64], vector[str], vector[f64]):
    a = vector([1, 2, 3])
    b = vector(["a", "b", "c"])
    c = vector([42.0, 43.0, 44.0])
    return a, b, c
```

函数 `return_vectors` 的返回类型是 `(vector[i64], vector[str], vector[f64])`。

但必须确保所有这些由函数返回的向量具有相同的长度，因为当它们被转换为行时，每一行必须呈现所有的列值。

当然，可以返回字面值，它们也会被转化为向量：
```python
from greptime import vector

@coprocessor(returns=["a", "b", "c"])
def return_vectors() -> (vector[i64], vector[str], vector[i64]):
    a = 1
    b = "Hello, GreptimeDB!"
    c = 42
    return a, b, c
```

## 查询数据

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

## 输入数据

用户也可以通过 `sql` API 输入数据

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

## HTTP API

`/scripts` 提交一个 Python 脚本到 GreptimeDB。

保存一个 Python 脚本，如 `test.py`：

```python
@coprocessor(args = ["number"],
             returns = [ "number" ],
             sql = "select number from numbers limit 5")
def square(number) -> vector[i64]:
    return number * 2
```

将其提交到数据库：

```shell
curl --data-binary @test.py -XPOST \
      "http://localhost:4000/v1/scripts?db=default&name=square"
```

```json
{"code":0}
```

Python 脚本被插入到 `scripts` 表中并被自动编译：

```shell
curl -G  http://localhost:4000/v1/sql  --data-urlencode "sql=select * from scripts"
```

```json
{
  "code": 0,
  "output": [{
    "records": {
      "schema": {
        "column_schemas": [
          {
            "name": "schema",
            "data_type": "String"
          },
          {
            "name": "name",
            "data_type": "String"
          },
          {
            "name": "script",
            "data_type": "String"
          },
          {
            "name": "engine",
            "data_type": "String"
          },
          {
            "name": "timestamp",
            "data_type": "TimestampMillisecond"
          },
          {
            "name": "gmt_created",
            "data_type": "TimestampMillisecond"
          },
          {
            "name": "gmt_modified",
            "data_type": "TimestampMillisecond"
          }
        ]
      },
      "rows": [
        [
          "default",
          "square",
          "@coprocessor(args = [\"number\"],\n             returns = [ \"number\" ],\n             sql = \"select number from numbers\")\ndef square(number):\n    return number * 2\n",
          "python",
          0,
          1676032587204,
          1676032587204
        ]
      ]
    }
  }],
  "execution_time_ms": 4
}
```

也可以通过 `/run-script` 执行脚本：

```shell
curl -XPOST -G "http://localhost:4000/v1/run-script?db=default&name=square"
```

```json
{
  "code": 0,
  "output": [{
    "records": {
      "schema": {
        "column_schemas": [
          {
            "name": "number",
            "data_type": "Float64"
          }
        ]
      },
      "rows": [
        [
          0
        ],
        [
          2
        ],
        [
          4
        ],
        [
          6
        ],
        [
          8
        ]
      ]
    }
  }],
  "execution_time_ms": 8
}
```

### Python 脚本的参数和结果

`/scripts` 接受指定数据库的查询参数 `db`，以及命名脚本的 `name`。`/scripts` 处理 POST 方法主体来作为脚本文件内容。

`/run-script` 通过 `db` 和 `name` 运行编译好的脚本，然后返回输出，这与 `/sql` API 中的查询结果相同。

`/run-script` 也接收其他查询参数，作为传递到协处理器的用户参数，参考[输入和输出](#input-the-coprocessor-function)。
