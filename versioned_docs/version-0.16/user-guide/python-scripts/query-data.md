# Query Data

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
