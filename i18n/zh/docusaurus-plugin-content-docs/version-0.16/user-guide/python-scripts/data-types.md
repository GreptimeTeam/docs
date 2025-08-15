# 数据类型

## DataFrame

DataFrame 表示具有相同命名列的逻辑行集，类似于 [Pandas DataFrame](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.html) 或 [Spark DataFrame](https://spark.apache.org/docs/latest/sql-programming-guide.html)。

可以从 `sql` 创建一个 DataFrame：

```python
from greptime import PyDataFrame, col
@copr(returns = ["value"])
def query_numbers() -> vector[f64]:
    df = PyDataFrame.from_sql("select number from numbers")
    return df.filter(col('number') <= 5).collect()[0]
```

这与 `select number from numbers where number <=5` 相同，但使用了 DataFrame API。

事实上，协处理器的 DataFrame API 是 Apache Datafusion [DataFrame API](https://arrow.apache.org/datafusion/user-guide/dataframe.html) 的一个封装器。请参考 [API](api.md) 文档以获得完整的 DataFrame API。

## 向量

向量是协处理器中的主要数据类型，它是同类值的向量。通常，它是查询结果中提取的一列，但也可以在 Python 脚本中构建它。

向量就像编程语言中的数组类型，Apache [Arrow](https://arrow.apache.org/) 中的 `Array` 或 [NumPy](https://numpy.org/doc/stable/reference/arrays.html) 中的 `NDArray`。

### 向量类型

协处理器引擎支持以下类型的向量：

| Type           | Description                      |
| -------------- | -------------------------------- |
| `vector[str]`  | The string type                  |
| `vector[bool]` | The boolean type                 |
| `vector[u8]`   | The 8-bit unsigned integer type  |
| `vector[u16]`  | The 16-bit unsigned integer type |
| `vector[u32]`  | The 32-bit unsigned integer type |
| `vector[u64]`  | The 64-bit unsigned integer type |
| `vector[i8]`   | The 8-bit signed integer type    |
| `vector[i16]`  | The 16-bit signed integer type   |
| `vector[i32]`  | The 32-bit signed integer type   |
| `vector[i64]`  | The 64-bit signed integer type   |
| `vector[f32]`  | The 32-bit floating point type   |
| `vector[f64]`  | The 64-bit floating point type   |
| `vector[none]` | The any type                     |

正如我们在 [Hello, world](./getting-started.md#hello-world-example) 的例子中看到的那样，如果我们想把它作为 SQL UDF 使用，我们可以为协处理器定义返回向量类型。否则，我们可以忽略返回向量类型的声明：

```python
@coprocessor(returns=['msg'])
def hello() -> vector[str]:
   return "hello, GreptimeDB"
```

协处理器引擎会根据结果推断出返回向量的类型。但是如果没有声明，除非通过 HTTP API，不然就不能在 SQL 中调用它。

### 构建一个向量

之前已经展示了在[查询数据](./query-data.md)中通过执行 `@coprocessor` 中的 `sql` 属性从查询结果中提取向量的例子。

我们可以从字面意义上创建一个向量：

```python
@copr(returns=["value"])
def answer() -> vector[i64]:
    return 42
```

结果 `42` 将被包装成 `vector[i64]` 的一个元素的向量。

```sql
mysql> select answer();
+----------+
| answer() |
+----------+
|       42 |
+----------+
1 row in set (0.01 sec)
```

我们可以从一个 Python 列表中创建一个向量：

```python
from greptime import vector

@copr(returns=["value"])
def answer() -> vector[i64]:
    return vector([42, 43, 44])
```

`greptime` 是一个内置模块，请参考 [API](./api.md) 文档。

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

事实上，`vector` 函数可以从 Python 的任何可迭代对象中创建一个向量。但是它要求所有的元素类型必须相同，而且它选择第一个元素的类型作为它的向量类型。

### 向量操作

向量支持很多操作：

1. 支持基本的算术运算，包括 `+`、`-`、`*`、`/`。
2. 支持基本的逻辑运算，包括 `&`, `|`, `~`。
3. 也支持基本的比较操作，包括 `>`, `<`, `>=`, `<=`, `==`, `！=`。

> 注意：这里我们覆盖了 bitwise 和 `&`，bitwise 或 `|`，bitwise 不是 `~` 的逻辑运算符，因为 Python 不支持逻辑运算符的覆盖 (不能覆盖 `and` `or` `not`)。
> [PEP335](https://peps.python.org/pep-0335/) 提出了一个建议，最终被拒绝。但是位操作符的优先级比比较操作符高，所以记得使用一对小括号来确保结果是想要的。
> 即如果想过滤一个在 0 和 100 之间的向量，应该使用 `(vector[i32] >= 0) & (vector[i32] <= 100)` 而不是 `vector[i32] >= 0 & vector[i32] <= 100`。后者将被评估为 `vector[i32] >= (0 & vector[i32]) <= 100`。

例如，可以将两个向量相加：

```python
@copr(args=["n1", "n2"],
      returns=["value"],
      sql="select number as n1,number as n2 from numbers limit 5")
def add_vectors(n1, n2) -> vector[i32]:
    return n1 + n2
```

或者用 Numpy 的方式对一个 bool 数组做比较：

```python
from greptime import vector

@copr(returns=["value"])
def compare() -> vector[bool]:
    # This returns a vector([False, False, True])
    return vector([1.0, 2.0, 3.0]) > 2.0
```

并使用 bool 数组的索引：

```python
from greptime import vector

@copr(returns=["value"])
def boolean_array() -> vector[f64]:
    v = vector([1.0, 2.0, 3.0])
    # This returns a vector([2.0])
    return v[(v > 1) & (v< 3)]
```

也支持两个向量之间的比较：

```python
from greptime import vector

@copr(returns=["value"])
def compare_vectors() -> vector[bool]:
    # This returns a vector([False, False, True])
    return vector([1.0, 2.0, 3.0]) > vector([1.0, 2.0, 2.0])
```

使用一个有索引的 bool 数组从一个向量中选择元素：

```python
from greptime import vector

@copr(returns=["value"])
def select_elements() -> (vector[f64]):
    a = vector([1.0, 2.0, 3.0])
    # This returns a vector([2.0, 3.0])
    return a[a>=2.0]
```

当然，我们可以使用列表理解法来构造一个新的向量：

```python
from greptime import vector

@copr(returns=["value"])
def list_comprehension() -> (vector[f64]):
    a = vector([1.0, 2.0, 3.0])
    # This returns a vector([3.0, 4.0])
    return [x+1 for x in a if a >= 2.0]
```
