---
keywords: [向量, 数据类型, AI 应用, 特征表示, 相似度计算, GreptimeDB, 向量存储, 向量计算]
description: 介绍了向量数据类型在 GreptimeDB 中的定义、写入和计算方法，适用于 AI 应用中的特征表示和相似度计算。
---

# 向量数据类型

## 概述

在人工智能领域，向量是一种重要的数据类型，用于表示数据集中的特征或者样本。向量可以用于许多机器学习和深度学习算法中，如推荐系统、自然语言处理和图像识别。引入向量类型后，GreptimeDB 可以更有效地支持这些 AI 应用，提供强大的向量存储和计算能力。

## 基本介绍

在 GreptimeDB 中，向量表示为固定维度的 Float32（32 位浮点数）数组。创建向量类型列时，必须指定向量的维度，并且维度在定义后不能更改。

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

在 GreptimeDB 中，你可以通过多种方式将向量数据写入数据库。最简单的方法是使用字符串形式，并通过隐式转换将其存储为向量。字符串需要用方括号 `[]` 包围。以下是使用隐式转换的 SQL 示例：

```sql
INSERT INTO <table> (<vec_col>) VALUES
('[<float32>, <float32>, ...]'),
('[<float32>, <float32>, ...]'),
...
('[<float32>, <float32>, ...]');
```

例如，插入 3 个三维向量：

```sql
INSERT INTO vecs (ts, vec_col) VALUES
('2024-11-18 00:00:01', '[1.0, 2.0, 3.0]'),
('2024-11-18 00:00:02', '[4.0, 5.0, 6.0]'),
('2024-11-18 00:00:03', '[7.0, 8.0, 9.0]');
```

如果你希望更明确地控制数据转换，可以使用 `parse_vec` 函数来显式地解析字符串为向量：

```sql
INSERT INTO vecs (ts, vec_col) VALUES
('2024-11-18 00:00:01', parse_vec('[1.0, 2.0, 3.0]')),
('2024-11-18 00:00:02', parse_vec('[4.0, 5.0, 6.0]')),
('2024-11-18 00:00:03', parse_vec('[7.0, 8.0, 9.0]'));
```

## 向量计算

GreptimeDB 支持多种向量函数，用于计算向量之间的相似度，包括 `vec_l2sq_distance`、`vec_cos_distance` 和 `vec_dot_product`。这些函数在 AI 应用中用于搜索最接近的内容。

可以使用以下 SQL 格式执行向量计算：

```sql
SELECT <distance_function>(<vec_col>, <target_vec>) FROM <table>;
```

例如，若要查找与给定向量 `[5.0, 5.0, 5.0]` 具有最小平方欧几里得距离的向量，并显示它们之间的距离，可以使用如下查询：

```sql
SELECT vec_to_string(vec_col), vec_l2sq_distance(vec_col, '[5.0, 5.0, 5.0]') AS distance 
FROM vecs 
ORDER BY distance;
```

执行此查询后，您将得到类似以下的结果：

```
+-----------------------------+----------+
| vec_to_string(vecs.vec_col) | distance |
+-----------------------------+----------+
| [4,5,6]                     |        2 |
| [1,2,3]                     |       29 |
| [7,8,9]                     |       29 |
+-----------------------------+----------+
3 rows in set (0.01 sec)
```

通过这种方式，GreptimeDB 可以帮助你快速识别和查找相似的数据向量，为 AI 应用提供强大的支持。

更多关于向量计算函数的信息，请参阅[向量函数参考文档](/reference/sql/functions/vector.md)。
