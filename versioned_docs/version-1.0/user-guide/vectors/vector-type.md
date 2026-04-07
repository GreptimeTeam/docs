---
keywords: [vector data type, AI applications, machine learning, deep learning, vector storage, vector computation, SQL vector functions]
description: Overview of vector data type in GreptimeDB, including how to define, insert, and perform calculations with vector type columns in SQL.
---

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

In GreptimeDB, you can insert vector data into the database in several ways. The simplest method is to use a string format and implicitly convert it to a vector. The string needs to be enclosed in square brackets `[]`. Below is an example of using implicit conversion in SQL:

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

If you wish to have more explicit control over data conversion, you can use the `parse_vec` function to explicitly parse a string into a vector:

```sql
INSERT INTO vecs (ts, vec_col) VALUES
('2024-11-18 00:00:01', parse_vec('[1.0, 2.0, 3.0]')),
('2024-11-18 00:00:02', parse_vec('[4.0, 5.0, 6.0]')),
('2024-11-18 00:00:03', parse_vec('[7.0, 8.0, 9.0]'));
```

## Vector Calculations

GreptimeDB supports various vector functions for calculating the similarity between vectors, including `vec_l2sq_distance`, `vec_cos_distance`, and `vec_dot_product`. These functions are used in AI applications to search for the most similar content.

To perform vector calculations, use the following SQL format:

```sql
SELECT <distance_function>(<vec_col>, <target_vec>) FROM <table>;
```

For example, to find the vector with the smallest squared Euclidean distance to a given vector `[5.0, 5.0, 5.0]` and display the distance, you can use the following query:

```sql
SELECT vec_to_string(vec_col), vec_l2sq_distance(vec_col, '[5.0, 5.0, 5.0]') AS distance 
FROM vecs 
ORDER BY distance;
```

Upon executing this query, you will get results similar to the following:

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

Through this approach, GreptimeDB enables you to quickly identify and locate similar data vectors, thus providing robust support for AI applications.

For more information about vector functions, please refer to the [Vector Functions Reference](/reference/sql/functions/vector.md).
