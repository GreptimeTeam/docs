# Coprocessor

The `@coprocesssor` annotation specifies a python function as a coprocessor in GreptimeDB and sets some attributes for it.

The engine allows one and only one function annotated with `@coprocesssor`. We can't have more than one coprocessor in one script.

| Parameter | Description | Example |
| --- | --- | --- |
| `sql` | Optional. The SQL statement that the coprocessor function will query data from the database and assign them to input `args`. | `@copr(sql="select * from cpu", ..)` |
| `args` | Optional. The column names that the coprocessor function will be taken as input, are the columns in query results by `sql`. | `@copr(args=["cpu", "mem"], ..)` |
| `returns` | The column names that the coprocessor function will return. The Coprocessor Engine uses it to generate the output schema. | `@copr(returns=["add", "sub", "mul", "div"], ..)` |
| `backend` | Optional. The coprocessor function will run on available engines like `rspy` and `pyo3`, which are associated with `RustPython` Backend and `CPython` Backend respectively. The default engine is set to `rspy`.  | `@copr(backend="rspy", ..)` |

Both `sql` and `args` are optional; they must either be provided together or not at all. They are usually used in post-query processing. Please read below.

The `returns` is required for every coprocessor because the output schema is necessary. 

`backend` is optional, because `RustPython` can't support C APIs and you might want to use `pyo3` backend to use third-party python libraries that only support C APIs. For example, `numpy`.

# Post-Query Processing
The coprocessor is helpful when processing a query result before it returns to the user.
For example, we want to normalize the value:
* Return zero instead of null or `NaN` if it misses,
* If it is greater than 100, return 100,
* If it is less than zero, return zero.

Then we can create a `normalize.py`:
```python
import math

def normalize0(x):
    if x is None or math.isnan(x):
        return 100
    elif x > 100:
        return 100
    elif x < 0:
        return 0
    else:
        return x

@coprocessor(args=["number"], sql="select number from numbers limit 10", returns=["value"])
def normalize(v) -> vector[i64]:
    return [normalize0(x) for x in v]
```

The `normalize0` function behaves as described above. And the `normalize` function is the coprocessor entry point:
* Execute the SQL `select value from demo`,
* Extract the column `value` in the query result and use it as the argument in the `normalize` function. Then invoke the function.
* In function, use list comprehension to process the `value` vector, which processes every element by the `normalize0` function.
* Returns the result named as `value` column.

The ` -> vector[i64]` part specifies the return column types for generating the output schema.

This example also demos how to import the stdlib and define other functions(the `normalize0`) for invoking.
The `normalize` coprocessor will be called in streaming. The query result may contain several batches, and the engine will call the coprocessor with each batch.
And we should remember that the columns extracted from the query result are all vectors. We will cover vectors in the next chapter.


