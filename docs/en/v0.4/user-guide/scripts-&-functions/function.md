# Function

## Coprocessor annotation

The `@coprocesssor` annotation specifies a python function as a coprocessor in GreptimeDB and sets some attributes for it.

The engine allows one and only one function annotated with `@coprocesssor`. We can't have more than one coprocessor in one script.

| Parameter | Description | Example |
| --- | --- | --- |
| `sql` | Optional. The SQL statement that the coprocessor function will query data from the database and assign them to input `args`. | `@copr(sql="select * from cpu", ..)` |
| `args` | Optional. The argument names that the coprocessor function will be taken as input, which are the columns in query results by `sql`. | `@copr(args=["cpu", "mem"], ..)` |
| `returns` | The column names that the coprocessor function will return. The Coprocessor Engine uses it to generate the output schema. | `@copr(returns=["add", "sub", "mul", "div"], ..)` |
| `backend` | Optional. The coprocessor function will run on available engines like `rspy` and `pyo3`, which are associated with `RustPython` Backend and `CPython` Backend respectively. The default engine is set to `rspy`.  | `@copr(backend="rspy", ..)` |

Both `sql` and `args` are optional; they must either be provided together or not at all. They are usually used in Post-Query processing. Please read below.

The `returns` is required for every coprocessor because the output schema is necessary.

`backend` is optional, because `RustPython` can't support C APIs and you might want to use `pyo3` backend to use third-party python libraries that only support C APIs. For example, `numpy`, `pandas` etc.

## Input of the coprocessor function

```python
@coprocessor(args=["number"], sql="select number from numbers limit 20", returns=["value"])
def normalize(v) -> vector[i64]:
    return [normalize0(x) for x in v]
```

The argument `v` is the `number` column(specified by the `args` attribute) in query results that are returned by executing the `sql`.

Of course, you can have several arguments:

```python
@coprocessor(args=["number", "number", "number"],
             sql="select number from numbers limit 5",
             returns=["value"])
def normalize(n1, n2, n3) -> vector[i64]:
    # returns [0,1,8,27,64]
    return n1 * n2 * n3
```

Except `args`, we can also pass user-defined parameters into the coprocessor:

```python
@coprocessor(returns=['value'])
def add(**params) -> vector[i64]:
    a = params['a']
    b = params['b']
    return int(a) + int(b)
```

And then pass the `a` and `b` from HTTP API:

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

We pass `a=42&b=99` as query params into HTTP API, and it returns the result `141`.

The user-defined parameters must be defined by `**kwargs` in the coprocessor, and all their types are strings. We can pass anything we want such as SQL to run in the coprocessor.

## Output of the coprocessor function

As we have seen in the previous examples, the output must be vectors.

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

The return types of function `return_vectors` is `(vector[i64], vector[str], vector[f64])`.

But we must ensure that all these vectors returned by the function have the same length. Because when they are converted into rows, each row must have all the column values presented.

Of course, we can return literal values, and they will be turned into vectors:

```python
from greptime import vector

@coprocessor(returns=["a", "b", "c"])
def return_vectors() -> (vector[i64], vector[str], vector[i64]):
    a = 1
    b = "Hello, GreptimeDB!"
    c = 42
    return a, b, c
```

## Query Data

We provide two ways to easily query data from GreptimeDB in Python Coprocessor:

* SQL: run a SQL string and return the query result.
* DataFrame API: a builtin module that describes and executes the query similar to a [Pandas DataFrame](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.html) or [Spark DataFrame](https://spark.apache.org/docs/latest/sql-programming-guide.html).

## SQL

Use the `greptime` module's `query` method to retrieve a query engine, then call `sql` function to execute a SQL string, for example:

```python
@copr(returns=["value"])
def query_numbers()->vector[f64]:
    from greptime import query
    return query().sql("select number from numbers limit 10")[0]
```

Call it via SQL client:

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

The `sql` function returns a list of columns, and each column is a vector of values.

In the above example, `sql("select number from numbers limit 10")` returns a list of vectors. And use `[0]` to retrieve the first column vector which is the `number` column in `select` SQL.

## Post-Query Processing

The coprocessor is helpful when processing a query result before it returns to the user.
For example, we want to normalize the value:

* Return zero instead of null or `NaN` if it misses,
* If it is greater than 5, return 5,
* If it is less than zero, return zero.

Then we can create a `normalize.py`:

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

The `normalize0` function behaves as described above. And the `normalize` function is the coprocessor entry point:

* Execute the SQL `select number from numbers limit 10`,
* Extract the column `number` in the query result and use it as the argument in the `normalize` function. Then invoke the function.
* In function, use list comprehension to process the `number` vector, which processes every element by the `normalize0` function.
* Returns the result named as `value` column.

The `-> vector[i64]` part specifies the return column types for generating the output schema.

This example also shows how to import the stdlib and define other functions(the `normalize0`) for invoking.
The `normalize` coprocessor will be called in streaming. The query result may contain several batches, and the engine will call the coprocessor with each batch.
And we should remember that the columns extracted from the query result are all vectors. We will cover vectors in the next chapter.

Submit and run this script will generate the output:

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

## Insert data

Of course, you can insert data by `sql` API too:

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

`/scripts` submits a Python script into GreptimeDB.

Save a python script such as `test.py`:

```python
@coprocessor(args = ["number"],
             returns = [ "number" ],
             sql = "select number from numbers limit 5")
def square(number) -> vector[i64]:
    return number * 2
```

Submits it to database:

```shell
curl --data-binary @test.py -XPOST \
      "http://localhost:4000/v1/scripts?db=default&name=square"
```

```json
{"code":0}
```

The python script is inserted into the `scripts` table and compiled automatically:

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

You can also execute the script via `/run-script`:

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

### Parameters and Result for Python scripts

`/scripts` accepts query parameters `db` which specifies the database, and `name` which names the script. `/scripts` processes the POST method body as the script file content.

`/run-script` runs the compiled script by `db` and `name`, then returns the output which is the same as the query result in `/sql` API.

`/run-script` also receives other query parameters as the user params passed into the coprocessor, refer to [Input and Output](#input-of-the-coprocessor-function).
