---
description: Lists and describes vector functions available in GreptimeDB, including their usage and examples.
---

# Vector Functions

This page lists all vector-related functions supported in GreptimeDB. Vector functions are primarily used for operations such as distance calculation, similarity measurement, and more.

## Distance Calculations

* `vec_l2sq_distance(vec1, vec2)`: Computes the squared L2 distance between two vectors.  
* `vec_cos_distance(vec1, vec2)`: Computes the cosine distance between two vectors.  
* `vec_dot_product(vec1, vec2)`: Computes the dot product of two vectors.  

These functions accept vector values as parameters. You can use the `parse_vec` function to convert a string into a vector value, such as `parse_vec('[1.0, 2.0, 3.0]')`. Also, vector strings (e.g., `[1.0, 2.0, 3.0]`) can be used directly and will be automatically converted. Regardless of the method used, the dimensionality of the vectors must remain consistent.

---

### `vec_l2sq_distance`

Calculates the squared Euclidean distance (squared L2 distance) between two vectors. L2 distance is the straight-line distance between two points in geometric space. This function returns the squared value to improve computational efficiency.

Example:

```sql
SELECT vec_l2sq_distance(parse_vec('[1.0, 2.0, 3.0]'), parse_vec('[2.0, 1.0, 4.0]'));
```

Or

```sql
SELECT vec_l2sq_distance('[1.0, 2.0, 3.0]', '[2.0, 1.0, 4.0]');
```


Details:

* Parameters are two vectors with consistent dimensions.  
* Output: A scalar value of type `Float32`.  

---

### `cos_distance`

Calculates the cosine distance between two vectors. Cosine distance measures the cosine of the angle between two vectors and is used to quantify similarity.

Example:

```sql
SELECT vec_cos_distance(parse_vec('[1.0, 2.0, 3.0]'), parse_vec('[2.0, 1.0, 4.0]'));
```

Or

```sql
SELECT vec_cos_distance('[1.0, 2.0, 3.0]', '[2.0, 1.0, 4.0]');
```

Details:

* Parameters are two vectors with consistent dimensions.
* Output: A scalar value of type `Float32`.  

---

### `dot_product`

Computes the dot product of two vectors. The dot product is the sum of the element-wise multiplications of two vectors. It is commonly used to measure similarity or for linear transformations in machine learning.

Example:

```sql
SELECT vec_dot_product(parse_vec('[1.0, 2.0, 3.0]'), parse_vec('[2.0, 1.0, 4.0]'));
```

Or

```sql
SELECT vec_dot_product('[1.0, 2.0, 3.0]', '[2.0, 1.0, 4.0]');
```

Details:

* Parameters are two vectors with consistent dimensions.
* Output: A scalar value of type `Float32`.  

## Conversion Functions

When dealing with vector data in the database, GreptimeDB provides convenient functions for converting between strings and vector values.

### `parse_vec`

Converts a string to a vector value. The string must be enclosed in square brackets `[]` and contain elements of type `Float32`, separated by commas.

Example:

```sql
CREATE TABLE vectors (
    ts TIMESTAMP,
    vec_col VECTOR(3)
);

INSERT INTO vectors (ts, vec_col) VALUES ('2024-11-18 00:00:01', parse_vec('[1.0, 2.0, 3.0]'));
```

### `vec_to_string`

Converts a vector object to a string. The converted string format is `[<float32>, <float32>, ...]`.

Example:

```sql
SELECT vec_to_string(vec_col) FROM vectors;
```
