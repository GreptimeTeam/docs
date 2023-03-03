# Input and Output

## Output
As we have seen in the previous examples, the output must be vectors.

We can return multi vectors:
```python
from greptime import vector

@coprocessor(returns=["a", "b", "c"])
def return_vectors():
    a = vector([1, 2, 3])
    b = vector(["a", "b", "c"])
    c = vector([42.0, 43.0, 44.0])
    return a, b, c
```

The return types of function `return_vectors` is `(vector[i64], vector[str], vector[f64])`. The Engine infers their types on runtime.

But we must ensure that all these vectors returned by the function have the same length. Because when they are converted into rows, each row must have all the column values.

Of course, we can return literal values, and they will be turned into vectors:
```python
from greptime import vector

@coprocessor(returns=["a", "b", "c"])
def return_vectors():
    a = 1
    b = "Hello, GreptimeDB!"
    c = 42
    return a, b, c
```
 

## Input

The coprocessor also accepts arguments:
```python

```
