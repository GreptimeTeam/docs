# Input and Output

## Output
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

But we must ensure that all these vectors returned by the function have the same length. Because when they are converted into rows, each row must have all the column values.

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
 

## Input

The coprocessor also accepts arguments already seen before:
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

And then you can pass the `a` and `b` from HTTP API:

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

The user-defined parameters must be passed by `**kwargs` in the coprocessor, and all their types are strings. We can pass anything we want such as SQL to run in the coprocessor.
