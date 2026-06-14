# API

## 内置模块和功能

我们提供了大量的内置函数供用户使用。下面是一个内置函数的列表。只要在脚本开头写上 `import greptime` 或 `from greptime import *` 就可以调用它们。

## 向量函数

| Function | Description |
| :--- | :--- |
| `pow(v0, v1)` | Raise a number `v0` to a power of `v1`. |
| `clip(v0, v1, v2)` | Clip all elements in a vector `v0` to a range between vectors `v1` and `v2`. |
| `diff(v0)` | Calculate the difference between adjacent elements in a vector `v0`. |
| `mean(v0)` | Calculate the mean of a vector `v0`. |
| `polyval(v0, v1)` | Evaluate a polynomial `v0` at points `v1`. similar to `numpy.polyval`. |
| `argmax(v0)` | Return the index of the maximum value in a vector `v0`. similar to `numpy.argmax`. |
| `argmin(v0)` | Return the index of the minimum value in a vector `v0`. similar to `numpy.argmin`. |
| `percentile` | Calculate the `q`-th percentile of a vector `v0`.  similar to `numpy.percentile`. |
| `scipy_stats_norm_cdf` | Calculate the cumulative distribution function for the normal distribution. similar to `scipy.stats.norm.cdf`. |
| `scipy_stats_norm_pdf` | Calculate the probability density function for the normal distribution. similar to `scipy.stats.norm.pdf`. |

## 数学函数

| Function | Description |
| :--- | :--- |
| `sqrt(v)` | Calculate the square root of a number `v`. |
| `sin(v)` | Calculate the sine of a number `v`. |
| `cos(v)` | Calculate the cosine of a number `v`. |
| `tan(v)` | Calculate the tangent of a number `v`. |
| `asin(v)` | Calculate the arcsine of a number `v`. |
| `acos(v)` | Calculate the arccosine of a number `v`. |
| `atan(v)` | Calculate the arctangent of a number `v`. |
| `floor(v)` | Calculate the floor of a number `v`. |
| `ceil(v)` | Calculate the ceiling of a number `v`. |
| `round(v)` | Calculate the nearest integer of a number `v`. |
| `trunc(v)` | Calculate the truncated integer of a number `v`. |
| `abs(v)` | Calculate the absolute value of a number `v`. |
| `signum(v)` | Calculate the sign(gives 1.0/-1.0) of a number `v`. |
| `exp(v)` | Calculate the exponential of a number `v`. |
| `ln(v)` | Calculate the natural logarithm of a number `v`. |
| `log2(v)` | Calculate the base-2 logarithm of a number `v`. |
| `log10(v)` | Calculate the base-10 logarithm of a number `v`. |

## 效用函数和聚合函数

这些函数是由 `DataFusion` 绑定的。
| Function | Description |
| :--- | :--- |
| `random(len)` | Generate a random vector with length `len`. |
| `approx_distinct(v0)` | Calculate the approximate number of distinct values in a vector `v0`. |
| `median(v0)` | Calculate the median of a vector `v0`. |
| `approx_percentile_cont(values, percent)` | Calculate the approximate percentile of a vector `values` at a given percentage `percent`. |
| `array_agg(v0)` | Aggregate values into an array. |
| `avg(v0)` | Calculate the average of a vector `v0`. |
| `correlation(v0, v1)` | Calculate the Pearson correlation coefficient of a vector `v0` and a vector `v1`. |
| `count(v0)` | Calculate the count of a vector `v0`. |
| `covariance(v0, v1)` | Calculate the covariance of a vector `v0` and a vector `v1`. |
| `covariance_pop(v0, v1)` | Calculate the population covariance of a vector `v0` and a vector `v1`. |
| `max(v0)` | Calculate the maximum of a vector `v0`. |
| `min(v0)` | Calculate the minimum of a vector `v0`. |
| `stddev(v0)` | Calculate the sample standard deviation of a vector `v0`. |
| `stddev_pop(v0)` | Calculate the population standard deviation of a vector `v0`. |
| `sum(v0)` | Calculate the sum of a vector `v0`. |
| `variance(v0)` | Calculate the sample variance of a vector `v0`. |
| `variance_pop(v0)` | Calculate the population variance of a vector `v0`. |

## 数据框架的 methods

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

## Expr 的 methods

| Method | Description |
| --- | --- |
| `col(name: str)` | Create a `PyExpr` that represents a column |
| `lit(value: Any)` | Create a `PyExpr` that represents a literal value |
| `sort(ascending: bool, null_first: bool)` | Create a `PyExpr` that represents a sort expression |
| comparison operators: `==`, `!=`, `>`, `>=`, `<`, `<=` | Create `PyExpr` from compare two `PyExpr` |
| logical operators: `&`, `\|`, `~` | Create `PyExpr` from logical operation between two `PyExpr` |
