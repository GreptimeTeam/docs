# 向量函数

本页面列出了 GreptimeDB 中所有支持的向量相关函数。向量函数主要用于处理向量运算，比如距离计算、相似度度量等。

## 距离计算

GreptimeDB 提供了以下常用的距离计算函数：

* `vec_l2sq_distance(vec1, vec2)`：计算两个向量之间的 L2 距离的平方。
* `vec_cos_distance(vec1, vec2)`：计算两个向量之间的余弦距离。
* `vec_dot_product(vec1, vec2)`：计算两个向量之间的点积。

这些函数接受向量值作为参数。你可以通过 `parse_vec` 函数将字符串转变为向量值，例如 `parse_vec('[1.0, 2.0, 3.0]')`。同时，字符串格式的向量（例如 `[1.0, 2.0, 3.0]`）也可以直接使用，它们会被自动转换。无论采用哪种方式，向量的维度必须保持一致。

### `vec_l2sq_distance`

计算两个向量之间的平方欧几里得距离（L2 距离的平方）。L2 距离是几何空间中两个点之间的直线距离，此函数返回其平方值以提高计算效率。

示例：

```sql
SELECT vec_l2sq_distance(parse_vec('[1.0, 2.0, 3.0]'), parse_vec('[2.0, 1.0, 4.0]'));
```

或者

```sql
SELECT vec_l2sq_distance('[1.0, 2.0, 3.0]', '[2.0, 1.0, 4.0]');
```

说明：
* 参数为两个维度一致的向量。
* 返回值类型为 `Float32` 标量。

### `vec_cos_distance`

计算两个向量之间的余弦距离。余弦距离是两个向量之间的夹角余弦值，用于衡量向量之间的相似度。

示例：

```sql
SELECT vec_cos_distance(parse_vec('[1.0, 2.0, 3.0]'), parse_vec('[2.0, 1.0, 4.0]'));
```

或者

```sql
SELECT vec_cos_distance('[1.0, 2.0, 3.0]', '[2.0, 1.0, 4.0]');
```

说明：
* 参数为两个维度一致的向量。
* 返回值类型为 `Float32` 标量。

### `vec_dot_product`

计算两个向量之间的点积。点积是两个向量对应元素的乘积之和，常用于度量两个向量的相似性或用于机器学习的线性变换中。

示例：

```sql
SELECT vec_dot_product(parse_vec('[1.0, 2.0, 3.0]'), parse_vec('[2.0, 1.0, 4.0]'));
```

或者

```sql
SELECT vec_dot_product('[1.0, 2.0, 3.0]', '[2.0, 1.0, 4.0]');
```

说明：
* 参数为两个维度一致的向量。
* 返回值类型为 `Float32` 标量。

## 转换函数

在处理数据库中的向量数据时，GreptimeDB 提供了方便的函数，用于在字符串和向量值之间进行转换。

### `parse_vec`

将字符串转换为向量值。字符串必须以方括号 `[]` 包围，并且包含 `Float32` 类型的元素，元素之间用逗号分隔。

示例：

```sql
CREATE TABLE vectors (
    ts TIMESTAMP,
    vec_col VECTOR(3)
);

INSERT INTO vectors (ts, vec_col) VALUES ('2024-11-18 00:00:01', parse_vec('[1.0, 2.0, 3.0]'));
```

### `vec_to_string`

将向量值转换为字符串。转换后的字符串格式为 `[<float32>, <float32>, ...]`。

示例：

```sql
SELECT vec_to_string(vec_col) FROM vectors;
```
