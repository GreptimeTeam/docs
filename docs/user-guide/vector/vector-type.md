# Vector Data Type

## Overview

In the field of artificial intelligence, vectors are an important data type used to represent features or samples within a dataset. Vectors are utilized in various machine learning and deep learning algorithms, such as recommendation systems, natural language processing, and image recognition. By introducing the vector type, GreptimeDB enables more efficient support for these AI applications, offering robust vector storage and computation capabilities.

## Basic Introduction to Vector Type

In GreptimeDB, a vector is represented as an array of Float32 (32-bit floating-point) with a fixed dimension. When creating a vector type column, the dimension must be specified and cannot be changed afterward.

## Defining a Vector Type Column

In SQL, a table with a vector type column can be defined using the following syntax. Note that the dimension `<dim>` must be a positive integer that specifies the length of the vector.

```sql
CREATE TABLE <table_name> (
  ...
  <vec_col> VECTOR(<dim>)
);
```

For example, to define a table with a vector type column of dimension 3:

```sql
CREATE TABLE vecs (
  ts TIMESTAMP TIME INDEX,
  vec_col VECTOR(3)
);
```

## Inserting Vector Data

In GreptimeDB, vector data is inserted as a string surrounded by square brackets `[]`. The number of elements in the string must match the specified vector dimension, otherwise an error will occur.

The SQL format to insert vector data is as follows:

```sql
INSERT INTO <table> (<vec_col>) VALUES
('[<float32>, <float32>, ...]'),
('[<float32>, <float32>, ...]'),
...
('[<float32>, <float32>, ...]');
```

For example, to insert three 3-dimensional vectors:

```sql
INSERT INTO vecs (ts, vec_col) VALUES
('2024-11-18 00:00:01', '[1.0, 2.0, 3.0]'),
('2024-11-18 00:00:02', '[4.0, 5.0, 6.0]'),
('2024-11-18 00:00:03', '[7.0, 8.0, 9.0]');
```

## Vector Calculations

GreptimeDB supports various vector computation functions for calculating the similarity between vectors, including `l2sq_distance`, `cos_distance`, and `dot_product`. These functions are used in AI applications to search for the most similar content.

To perform vector calculations, use the following SQL format:

```sql
SELECT <distance_function>(<vec_col>, <target_vec>) FROM <table>;
```

For example, to find the vector with the smallest squared L2 distance to `[5.0, 5.0, 5.0]` and display the distance:

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

Through this approach, GreptimeDB enables you to quickly identify and locate similar data vectors, thus providing robust support for AI applications.

For more information about vector computation functions, please refer to the [Vector Computation Functions Reference](/reference/sql/functions/vector.md).
