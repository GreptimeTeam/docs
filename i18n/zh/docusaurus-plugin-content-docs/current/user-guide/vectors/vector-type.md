# 向量数据类型

## 概述

在人工智能领域，向量是一种重要的数据类型，用于表示数据集中的特征或者样本。向量可以用于许多机器学习和深度学习算法中，如推荐系统、自然语言处理和图像识别。引入向量类型后，GreptimeDB 可以更有效地支持这些 AI 应用，提供强大的向量存储和计算能力。

## 基本介绍

在 GreptimeDB 中，向量表示为固定维度的 Float32（32位浮点数）数组。创建向量类型列时，必须指定向量的维度，并且维度在定义后不能更改。

## 定义向量类型列

在 SQL 中，可以通过以下语法来定义包含向量类型的表。需要注意的是，维度 `<dim>` 必须是一个正整数，用于定义向量的长度。

```sql
CREATE TABLE <table_name> (
  ...
  <vec_col> VECTOR(<dim>)
);
```

例如，定义一个具有维度 3 的向量类型列的表：

```sql
CREATE TABLE vecs (
  ts TIMESTAMP TIME INDEX,
  vec_col VECTOR(3)
);
```

## 向量写入

在 GreptimeDB 中，向量数据以字符串形式写入，值需要被方括号 `[]` 包围。字符串中元素的数量必须与指定的向量维度相同，否则会产生错误。

可以使用以下 SQL 格式插入向量数据：

```sql
INSERT INTO <table> (<vec_col>) VALUES
('[<float32>, <float32>, ...]'),
('[<float32>, <float32>, ...]'),
...
('[<float32>, <float32>, ...]');
```

例如，插入三个三维向量：

```sql
INSERT INTO vecs (ts, vec_col) VALUES
('2024-11-18 00:00:01', '[1.0, 2.0, 3.0]'),
('2024-11-18 00:00:02', '[4.0, 5.0, 6.0]'),
('2024-11-18 00:00:03', '[7.0, 8.0, 9.0]');
```

## 向量计算

GreptimeDB 支持多种向量函数，用于计算向量之间的相似度，包括 `l2sq_distance`、`cos_distance` 和 `dot_product`。这些函数在 AI 应用中用于搜索最接近的内容。

可以使用以下 SQL 格式执行向量计算：

```sql
SELECT <distance_function>(<vec_col>, <target_vec>) FROM <table>;
```

例如，查找与向量 `[5.0, 5.0, 5.0]` 具有最小平方欧几里得距离的向量，并显示距离：

```sql
SELECT vec_col, l2sq_distance(vec_col, '[5.0, 5.0, 5.0]') as distance FROM vecs ORDER BY distance;
```

```
+---------+----------+
| vec_col | distance |
+---------+----------+
| [4,5,6] |        2 |
| [1,2,3] |       29 |
| [7,8,9] |       29 |
+---------+----------+
3 rows in set (0.01 sec)
```

通过这种方式，GreptimeDB 可以帮助你快速识别和查找相似的数据向量，为 AI 应用提供强大的支持。

更多关于向量计算函数的信息，请参阅[向量函数参考文档](/reference/sql/functions/vector.md)。
