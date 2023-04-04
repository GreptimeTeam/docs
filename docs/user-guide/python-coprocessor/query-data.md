# Query data

We provide two ways to easily query data from GreptimeDB in Python Corpcessor:
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

## DataFrame
A DataFrame represents a logical set of rows with the same named columns,  similar to a [Pandas DataFrame](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.html) or [Spark DataFrame](https://spark.apache.org/docs/latest/sql-programming-guide.html).

You can create a dataframe from `sql`:

```python
from greptime import PyDataFrame, col

@copr(returns = ["value"])
def query_numbers() -> vector[f64]:
    df = PyDataFrame.from_sql("select number from numbers")
    return df.filter(col('number') <= 5).collect()[0]
```

It's the same as `select number from numbers where number <=5`, but uses dataframe API.

In fact, the coprocessor's dataframe API is a wrapper of  Apache Datafusion [DataFrame API](https://arrow.apache.org/datafusion/user-guide/dataframe.html).

### DataFrame's methods:
| Method | Description |
| --- | --- |
| `select_columns(columns: List[str])` | select columns from DataFrame |
| `select(columns: List[Expr]])` | select columns from DataFrame using `PyExpr` |
| `filter(condition: Expr)` | filter DataFrame using `PyExpr` |
| `aggregate(group_expr: List[Expr], aggr_expr: List[Expr])` | Perform an aggregate query with optional grouping expressions. |
| `limit(skip: int, fetch: Optional[int])` |Limit the number of rows returned from this DataFrame. `skip` - Number of rows to skip before fetch any row; `fetch` - Maximum number of rows to fetch, after skipping skip rows.
| `union(other: DataFrame)` | Union two DataFrame |
| `union_distinct(other: DataFrame)` | Union two DataFrame, but remove duplicate rows |
| `distinct()` | Remove duplicate rows |
| `sort(expr: List[Expr])` | Sort DataFrame by `PyExpr`, Sort the DataFrame by the specified sorting expressions. Any expression can be turned into a sort expression by calling its sort method. |
| `join(right: DataFrame, left_cols: List[str], right_cols: List[str], filter: Optional[Expr])` | Join two DataFrame using the specified columns as join keys. Eight Join Types are supported: `inner`, `left`, `right`, `full`, `leftSemi`, `leftAnti`, `rightSemi`, `rightAnti`. |
| `intersect(other: DataFrame)` | Intersect two DataFrame |
| `except(other: DataFrame)` | Except two DataFrame |
| `collect()` | Collect DataFrame to a list of `PyVector` |

## Expr's methods:
| Method | Description |
| --- | --- |
| `col(name: str)` | Create a `PyExpr` that represents a column |
| `lit(value: Any)` | Create a `PyExpr` that represents a literal value |
| `sort(ascending: bool, null_first: bool)` | Create a `PyExpr` that represents a sort expression |
| comparison operators: `==`, `!=`, `>`, `>=`, `<`, `<=` | Create `PyExpr` from compare two `PyExpr` |
| logical operators: `&`, `\|`, `~` | Create `PyExpr` from logical operation between two `PyExpr` |

