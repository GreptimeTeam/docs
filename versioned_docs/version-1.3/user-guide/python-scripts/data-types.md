# Data Types

## DataFrame

A DataFrame represents a logical set of rows with the same named columns,  similar to a [Pandas DataFrame](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.html) or [Spark DataFrame](https://spark.apache.org/docs/latest/sql-programming-guide.html).

You can create a dataframe from `sql`:

```python
from greptime import PyDataFrame, col
@copr(returns = ["value"])
def query_numbers() -> vector[f64]:
    df = PyDataFrame.from_sql("select number from numbers")
    return df.filter(col('number') <= 5).collect()[0]
```

It's the same as `select number from numbers where number <=5`, but uses dataframe API.

In fact, the coprocessor's dataframe API is a wrapper of  Apache Datafusion [DataFrame API](https://arrow.apache.org/datafusion/user-guide/dataframe.html). Please refer to [API](api.md) document to get the full DataFrame API.

## Vector

The vector is the major data type in Coprocessor, it's a vector of values in the same type. Usually, it comes from extracting a column from the query result, but you can also construct it in the python script.

The vector is like the array type in the programming language, `Array` in Apache [Arrow](https://arrow.apache.org/) or `NDArray` in [NumPy](https://numpy.org/doc/stable/reference/arrays.html).

### Vector Types

The Coprocessor Engine supports the following vector types:

|  Type | Description  |
|---|---|
| `vector[str]`  |  The string  type |
| `vector[bool]` | The boolean type |
|  `vector[u8]`|  The 8-bit unsigned integer type |
|  `vector[u16]` | The 16-bit unsigned integer  type |
|  `vector[u32]`|  The 32-bit unsigned integer type |
|  `vector[u64]` |  The 64-bit unsigned integer type |
|  `vector[i8]` | The 8-bit signed integer type |
|  `vector[i16]` | The 16-bit signed integer type |
|  `vector[i32]` |  The 32-bit signed integer type |
|  `vector[i64]` | The 64-bit signed integer type |
|  `vector[f32]` | The 32-bit floating point type |
|  `vector[f64]` | The 64-bit floating point type |
|  `vector[none]` | The any type  |

As we see in [Hello, world](./getting-started.md#hello-world-example), we can define the return vector types for the coprocessor if we want to use it as SQL UDF. Otherwise, we can ignore the return vector types declaration:

```python
@coprocessor(returns=['msg'])
def hello() -> vector[str]:
   return "hello, GreptimeDB"
```

The Coprocessor Engine will infer the return vector types by the result. But without the declaration, we can't call it in SQL except by HTTP API.

### Construct a vector

We have already seen the example that extracting vectors from the query result by executing the `sql` attribute in `@coprocessor` in [Query Data](./query-data.md).

We can create a vector from literals:

```python
@copr(returns=["value"])
def answer() -> vector[i64]:
    return 42
```

The result `42` will be wrapped as a one-element vector of `vector[i64]`.

```sql
mysql> select answer();
+----------+
| answer() |
+----------+
|       42 |
+----------+
1 row in set (0.01 sec)
```

We can create a vector from a python list:

```python
from greptime import vector

@copr(returns=["value"])
def answer() -> vector[i64]:
    return vector([42, 43, 44])
```

The `greptime` is a built-in module, please refer to [API Document](./api.md).

```sql
mysql> select answer();
+----------+
| answer() |
+----------+
|       42 |
|       43 |
|       44 |
+----------+
3 rows in set (0.02 sec)
```

In fact, the `vector` function can create a vector from any iterable object in python. But it requires all the element types must be the same, and it chooses the first element's type as its vector type.

### Vector operations

The vector supports a lot of operations:

1. Basic arithmetic operators are supported, including `+`, `-`, `*`, `/`.
2. Basic logic operations are supported, including `&`, `|`, `~`.
3. Basic comparison operation including`>`, `<`, `>=`, `<=`, `==`, `!=` are supported too.

> Note: Here we override bitwise and `&`, bitwise or `|`, bitwise not `~` logical operator because Python doesn't support logical operator override(You can't override `and` `or` `not`). [PEP335](https://peps.python.org/pep-0335/) made a proposal and was eventually rejected. But bitwise operators have higher precedence than comparison operators, so remember to use a pair of parentheses to make sure the result is what you want.
> i.e. if you want to filter a vector that's between 0 and 100, you should use `(vector[i32] >= 0) & (vector[i32] <= 100)` not `vector[i32] >= 0 & vector[i32] <= 100`. The latter one will be evaluated as `vector[i32] >= (0 & vector[i32]) <= 100`.

For example, you can plus two vectors directly:

```python
@copr(args=["n1", "n2"],
      returns=["value"],
      sql="select number as n1,number as n2 from numbers limit 5")
def add_vectors(n1, n2) -> vector[i32]:
    return n1 + n2
```

Or do a comparison with a bool array in a Numpy way:

```python
from greptime import vector

@copr(returns=["value"])
def compare() -> vector[bool]:
    # This returns a vector([False, False, True])
    return vector([1.0, 2.0, 3.0]) > 2.0
```

And using the boolean array indexing:

```python
from greptime import vector

@copr(returns=["value"])
def boolean_array() -> vector[f64]:
    v = vector([1.0, 2.0, 3.0])
    # This returns a vector([2.0])
    return v[(v > 1) & (v< 3)]
```

Comparison between two vectors is also supported:

```python
from greptime import vector

@copr(returns=["value"])
def compare_vectors() -> vector[bool]:
    # This returns a vector([False, False, True])
    return vector([1.0, 2.0, 3.0]) > vector([1.0, 2.0, 2.0])
```

Using an indexed bool array to select elements from a vector:

```python
from greptime import vector

@copr(returns=["value"])
def select_elements() -> (vector[f64]):
    a = vector([1.0, 2.0, 3.0])
    # This returns a vector([2.0, 3.0])
    return a[a>=2.0]
```

Of course, we can use list comprehension to construct a new vector:

```python
from greptime import vector

@copr(returns=["value"])
def list_comprehension() -> (vector[f64]):
    a = vector([1.0, 2.0, 3.0])
    # This returns a vector([3.0, 4.0])
    return [x+1 for x in a if a >= 2.0]
```
