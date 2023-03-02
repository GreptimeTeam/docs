The `@coprocesssor` annotation specifies a python function as a coprocessor in GreptimeDB and sets some attributes for it.

The engine allows one and only one function annotated with `@coprocesssor`. We can't have more than one coprocessor in one script.

| Parameter | Description | Example |
| --- | --- | --- |
| `sql` | Optional parameters. The SQL statement that the coprocessor function will execute that queries data from the database and assign it to input `args`, only useful if you are running this Coprocessor on a table.  | `@copr(sql="select * from cpu", ..)` |
| `args` | Optional. The columns that the coprocessor function will take as input. | `@copr(args=["cpu", "mem"], ..)` |
| `returns` | The columns that the coprocessor function will return. The Coprocessor Engine uses it to generate the output schema. | `@copr(returns=["add", "sub", "mul", "div"], ..)` |
| `backend` | Optional parameters. The backend that the coprocessor function will execute on available options are `rspy` and `pyo3` which corresponding to `RustPython` Backend and `CPython` Backend. Default to use `RustPython` Backend  | `@copr(backend="rspy", ..)` |

Both `sql` and `args` are optional; they must be provided together or both not.

The `returns` is required for every coprocessor because the output schema is necessary. 

`backend` is optional because `RustPython` can't support C API and you might want to use `pyo3` backend to use third-party python libraries that only support C API.

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

@coprocessor(args=["value"], sql="select value from demo", returns=["value"])
def normalize(v):
    return [normalize0(x) for x in v]
```

The `normalize0` function behaves as described above. And the `normalize` function is the coprocessor entry:
* Execute the SQL `select value from demo`,
* Extract the column `value` in the query result and use it as the argument in the `normalize` function. Then invoke the function.
* In function, use list comprehension to process the `value` vector, which processes every element by the `normalize0`function.
* Returns the result named  the`value` column.

This example also demos how to import the stdlib and define other functions(the `normalize0`) for invoking.
The `normalize` coprocessor will be called in streaming. The query result may contain several batches, and the engine will call the coprocessor with each batch.
And we should remember that the columns extracted from the query result are all vectors. We will cover vectors in the next chapter.


