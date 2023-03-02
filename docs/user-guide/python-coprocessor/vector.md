`vector` is the major datatypes in Coprocessor, it's a vector of values of the same type. Usually it come from extract a column from `RecordBatch`, but you can also construct it from inside python script.
## Supported operations
basic arthtmetic operations are supported, including `+`, `-`, `*`, `/`.

basic logic operation `and`, `or`, `not`.

Basic comparsion operation `>`, `<`, `>=`, `<=`, `==`, `!=`.

this means for example, you can write a coprocessor function like this(This return a `vector([3.0])`):
```python
@copr(returns=["value"])
def fun() -> (vector[f64]):
    return 1 + 2
```
Or create vector with `vector` function:
```python
@copr(returns=["value"])
def fun() -> (vector[f64]):
    return vector([1.0, 2, 3])
```
Or do comparsion with bool array in a numpy manner:
```python
@copr(returns=["value"])
def fun() -> (vector[bool]):
    # This returns a vector([False, False, True])
    return vector([1.0, 2, 3]) > 2
```
Compare between two vectors is also supported:
```python
@copr(returns=["value"])
def fun() -> (vector[bool]):
    # This returns a vector([False, False, True])
    return vector([1.0, 2, 3]) > vector([1.0, 2, 2])
```
Using indexed bool array to select elements from a vector is also supported:
```python
@copr(returns=["value"])
def fun() -> (vector[f64]):
    a = vector([1.0, 2, 3])
    a[a>2] = 0
    # This returns a vector([1.0, 2.0, 0.0])
    return a
```