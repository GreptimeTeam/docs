# Query data

We provide two way for you to easily query data:
1. through plain SQL by write `query.sql(..)` :this returns a list[list [ PyVector ] ] that's convert from query result.
For example:
```python
@copr(returns=["value"])
def func()->vector[f64]:
    # assuming value is a f64 column
    return query.sql("select value from table")[0][0]
```

2. through DataFrame API: By using `dataframe` API, you can easily query data and do some data analysis. By default `dataframe` holds a DataFrame that's convert from current coprocessor's input data(`RecordBatch`). You can also use `dataframe.from_sql(..)` to query data from database, [but this feature is only availableafter this PR got merged](https://github.com/GreptimeTeam/greptimedb/pull/1036).
For example:
```python
@copr(returns=["value"])
def func()->vector[f64]:
    from greptime import col
    # assuming value is a f64 column
    df = dataframe.select(col("value"))
    return df.sort().collect()[0][0]
```

The full DataFrame API is listed below:
## DataFrame's methods:
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