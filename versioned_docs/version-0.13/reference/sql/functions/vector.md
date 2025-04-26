---
keywords: [vector functions, distance calculations, similarity measurement, vector operations, SQL functions]
description: Lists and describes vector functions available in GreptimeDB, including their usage and examples.
---

# Vector Functions

This page lists all supported vector-related functions in GreptimeDB. Vector functions are primarily used for handling vector operations, such as basic arithmetic, distance calculations, conversion functions, and more.

## Basic Operations

### `vec_scalar_add`

Adds a scalar to a vector. Each element in the vector is added to the scalar, returning a new vector.

Examples:

```sql
SELECT vec_to_string(vec_scalar_add(2.0, parse_vec('[1.0, 2.0, 3.0]')));
```

```sql
+------------------------------------------------------------------------------+
| vec_to_string(vec_scalar_add(Float64(2),parse_vec(Utf8("[1.0, 2.0, 3.0]")))) |
+------------------------------------------------------------------------------+
| [3,4,5]                                                                      |
+------------------------------------------------------------------------------+
```

```
SELECT vec_to_string(vec_scalar_add(2.0, '[1.0, 2.0, 3.0]')); -- Implicitly convert string to vector
```

```sql
+-------------------------------------------------------------------+
| vec_to_string(vec_scalar_add(Float64(2),Utf8("[1.0, 2.0, 3.0]"))) |
+-------------------------------------------------------------------+
| [3,4,5]                                                           |
+-------------------------------------------------------------------+
```

```
SELECT vec_to_string(vec_scalar_add(-2.0, parse_vec('[1.0, 2.0, 3.0]'))); -- Subtraction
```

```sql
+-------------------------------------------------------------------------------+
| vec_to_string(vec_scalar_add(Float64(-2),parse_vec(Utf8("[1.0, 2.0, 3.0]")))) |
+-------------------------------------------------------------------------------+
| [-1,0,1]                                                                      |
+-------------------------------------------------------------------------------+
```

### `vec_scalar_mul`

Multiplies a vector by a scalar. Each element in the vector is multiplied by the scalar, returning a new vector.

Examples:

```sql
SELECT vec_to_string(vec_scalar_mul(2.0, parse_vec('[1.0, 2.0, 3.0]')));
```

```sql
+------------------------------------------------------------------------------+
| vec_to_string(vec_scalar_mul(Float64(2),parse_vec(Utf8("[1.0, 2.0, 3.0]")))) |
+------------------------------------------------------------------------------+
| [2,4,6]                                                                      |
+------------------------------------------------------------------------------+
```

```sql
SELECT vec_to_string(vec_scalar_mul(2.0, '[1.0, 2.0, 3.0]')); -- Implicitly convert string to vector
```

```sql
+------------------------------------------------------------------------------+
| vec_to_string(vec_scalar_mul(Float64(2),parse_vec(Utf8("[1.0, 2.0, 3.0]")))) |
+------------------------------------------------------------------------------+
| [2,4,6]                                                                      |
+------------------------------------------------------------------------------+
```

```sql
SELECT vec_to_string(vec_scalar_mul(1.0/2.0, parse_vec('[1.0, 2.0, 3.0]'))); -- Division
```

```sql
+-------------------------------------------------------------------------------------------+
| vec_to_string(vec_scalar_mul(Float64(1) / Float64(2),parse_vec(Utf8("[1.0, 2.0, 3.0]")))) |
+-------------------------------------------------------------------------------------------+
| [0.5,1,1.5]                                                                               |
+-------------------------------------------------------------------------------------------+
```

### `vec_add`

Adds two vectors element-wise. Returns a new vector where each element is the sum of corresponding elements in the input vectors.

Examples:

```sql
SELECT vec_to_string(vec_add(parse_vec('[1.0, 2.0, 3.0]'), parse_vec('[2.0, 1.0, 4.0]')));
```

```sql
+-----------------------------------------------------------------------------------------------+
| vec_to_string(vec_add(parse_vec(Utf8("[1.0, 2.0, 3.0]")),parse_vec(Utf8("[2.0, 1.0, 4.0]")))) |
+-----------------------------------------------------------------------------------------------+
| [3,3,7]                                                                                       |
+-----------------------------------------------------------------------------------------------+
```

```sql
SELECT vec_to_string(vec_add('[1.0, 2.0, 3.0]', '[2.0, 1.0, 4.0]')); -- Implicitly convert strings to vectors
```

```sql
+-------------------------------------------------------------------------+
| vec_to_string(vec_add(Utf8("[1.0, 2.0, 3.0]"),Utf8("[2.0, 1.0, 4.0]"))) |
+-------------------------------------------------------------------------+
| [3,3,7]                                                                 |
+-------------------------------------------------------------------------+
```

### `vec_sub`

Subtracts two vectors element-wise. Returns a new vector where each element is the difference of corresponding elements in the input vectors.

Examples:

```sql
SELECT vec_to_string(vec_sub(parse_vec('[1.0, 2.0, 3.0]'), parse_vec('[2.0, 1.0, 4.0]')));
```

```sql
+-----------------------------------------------------------------------------------------------+
| vec_to_string(vec_sub(parse_vec(Utf8("[1.0, 2.0, 3.0]")),parse_vec(Utf8("[2.0, 1.0, 4.0]")))) |
+-----------------------------------------------------------------------------------------------+
| [-1,1,-1]                                                                                     |
+-----------------------------------------------------------------------------------------------+
```

```sql
SELECT vec_to_string(vec_sub('[1.0, 2.0, 3.0]', '[2.0, 1.0, 4.0]')); -- Implicitly convert strings to vectors
```

```sql
+-------------------------------------------------------------------------+
| vec_to_string(vec_sub(Utf8("[1.0, 2.0, 3.0]"),Utf8("[2.0, 1.0, 4.0]"))) |
+-------------------------------------------------------------------------+
| [-1,1,-1]                                                               |
+-------------------------------------------------------------------------+
```

### `vec_mul`

Multiplies two vectors element-wise. Returns a new vector where each element is the product of corresponding elements in the input vectors.


Examples:

```sql
SELECT vec_to_string(vec_mul(parse_vec('[1.0, 2.0, 3.0]'), parse_vec('[2.0, 1.0, 4.0]')));
```

```sql
+-----------------------------------------------------------------------------------------------+
| vec_to_string(vec_mul(parse_vec(Utf8("[1.0, 2.0, 3.0]")),parse_vec(Utf8("[2.0, 1.0, 4.0]")))) |
+-----------------------------------------------------------------------------------------------+
| [2,2,12]                                                                                      |
+-----------------------------------------------------------------------------------------------+
```

```sql
SELECT vec_to_string(vec_mul('[1.0, 2.0, 3.0]', '[2.0, 1.0, 4.0]')); -- Implicitly convert strings to vectors
```

```sql
+-------------------------------------------------------------------------+
| vec_to_string(vec_mul(Utf8("[1.0, 2.0, 3.0]"),Utf8("[2.0, 1.0, 4.0]"))) |
+-------------------------------------------------------------------------+
| [2,2,12]                                                                |
+-------------------------------------------------------------------------+
```

### `vec_div`

Divides two vectors element-wise. Returns a new vector where each element is the quotient of corresponding elements in the input vectors.

Examples:

```sql
SELECT vec_to_string(vec_div(parse_vec('[1.0, 2.0, 3.0]'), parse_vec('[2.0, 1.0, 4.0]')));
```

```sql
+-----------------------------------------------------------------------------------------------+
| vec_to_string(vec_div(parse_vec(Utf8("[1.0, 2.0, 3.0]")),parse_vec(Utf8("[2.0, 1.0, 4.0]")))) |
+-----------------------------------------------------------------------------------------------+
| [0.5,2,0.75]                                                                                  |
+-----------------------------------------------------------------------------------------------+
```

```sql
SELECT vec_to_string(vec_div('[1.0, 2.0, 3.0]', '[2.0, 1.0, 4.0]')); -- Implicitly convert strings to vectors
```

```sql
+-------------------------------------------------------------------------+
| vec_to_string(vec_div(Utf8("[1.0, 2.0, 3.0]"),Utf8("[2.0, 1.0, 4.0]"))) |
+-------------------------------------------------------------------------+
| [0.5,2,0.75]                                                            |
+-------------------------------------------------------------------------+
```

### `vec_elem_sum`

Sums all elements of a vector, returning a scalar value.

Examples:

```sql
SELECT vec_elem_sum(parse_vec('[1.0, 2.0, 3.0]'));
```

```sql
+--------------------------------------------------+
| vec_elem_sum(parse_vec(Utf8("[1.0, 2.0, 3.0]"))) |
+--------------------------------------------------+
|                                                6 |
+--------------------------------------------------+
```

```sql
SELECT vec_elem_sum('[1.0, 2.0, 3.0]'); -- Implicitly convert string to vector
```

```sql
+---------------------------------------+
| vec_elem_sum(Utf8("[1.0, 2.0, 3.0]")) |
+---------------------------------------+
|                                     6 |
+---------------------------------------+
```

### `vec_elem_product`

Computes the product of all elements in a vector, returning a scalar value.

Examples:

```sql
SELECT vec_elem_product(parse_vec('[1.0, 2.0, 3.0]'));
```

```sql
+------------------------------------------------------+
| vec_elem_product(parse_vec(Utf8("[1.0, 2.0, 3.0]"))) |
+------------------------------------------------------+
|                                                    6 |
+------------------------------------------------------+
```

```sql
SELECT vec_elem_product('[1.0, 2.0, 3.0]'); -- Implicitly convert string to vector
```

```sql
+-------------------------------------------+
| vec_elem_product(Utf8("[1.0, 2.0, 3.0]")) |
+-------------------------------------------+
|                                         6 |
+-------------------------------------------+
```

### `vec_norm`

Normalizes a vector. Divides each element of the vector by the L2 norm of the vector, returning a new unit vector.

Equivalent to `vec_scalar_mul(1.0 / sqrt(vec_elem_sum(vec_mul(vec, vec))), vec)`.

Examples:

```sql
SELECT vec_to_string(vec_norm(parse_vec('[1.0, 2.0, 3.0]')));
```

```sql
+-------------------------------------------------------------+
| vec_to_string(vec_norm(parse_vec(Utf8("[1.0, 2.0, 3.0]")))) |
+-------------------------------------------------------------+
| [0.26726124,0.5345225,0.8017837]                            |
+-------------------------------------------------------------+

-- Equivalent to:
-- SELECT vec_to_string(vec_scalar_mul(1.0 / sqrt(vec_elem_sum(vec_mul(vec, vec))), vec))
-- FROM (SELECT '[1.0, 2.0, 3.0]' AS vec);
-- +--------------------------------------------------------------------------------------+
-- | vec_to_string(vec_scalar_mul(Float64(1) / sqrt(vec_elem_sum(vec_mul(vec,vec))),vec)) |
-- +--------------------------------------------------------------------------------------+
-- | [0.26726124,0.5345225,0.8017837]                                                     |
-- +--------------------------------------------------------------------------------------+
```

```sql
SELECT vec_to_string(vec_norm('[1.0, 2.0, 3.0]')); -- Implicitly convert string to vector
```

```sql
+--------------------------------------------------+
| vec_to_string(vec_norm(Utf8("[1.0, 2.0, 3.0]"))) |
+--------------------------------------------------+
| [0.26726124,0.5345225,0.8017837]                 |
+--------------------------------------------------+
```

## Aggregate Functions

### `vec_sum`

Sums all vectors in a vector column element-wise, returning a new vector.

Examples:

```sql
CREATE TABLE vectors (
    ts TIMESTAMP TIME INDEX,
    vec_col VECTOR(3),
);

INSERT INTO vectors (ts, vec_col) VALUES ('2024-11-18 00:00:01', '[1.0, 2.0, 3.0]');
INSERT INTO vectors (ts, vec_col) VALUES ('2024-11-18 00:00:02', '[2.0, 1.0, 4.0]');
INSERT INTO vectors (ts, vec_col) VALUES ('2024-11-18 00:00:03', '[3.0, 3.0, 3.0]');

SELECT vec_to_string(vec_sum(vec_col)) FROM vectors;
```

```sql
+-----------------------------------------+
| vec_to_string(vec_sum(vectors.vec_col)) |
+-----------------------------------------+
| [6,6,10]                                |
+-----------------------------------------+
```

### `vec_product`

Multiplies all vectors in a vector column element-wise, returning a new vector.

Examples:

```sql
CREATE TABLE vectors (
    ts TIMESTAMP TIME INDEX,
    vec_col VECTOR(3),
);

INSERT INTO vectors (ts, vec_col) VALUES ('2024-11-18 00:00:01', '[1.0, 2.0, 3.0]');
INSERT INTO vectors (ts, vec_col) VALUES ('2024-11-18 00:00:02', '[2.0, 1.0, 4.0]');
INSERT INTO vectors (ts, vec_col) VALUES ('2024-11-18 00:00:03', '[3.0, 3.0, 3.0]');

SELECT vec_to_string(vec_product(vec_col)) FROM vectors;
```

```sql
+---------------------------------------------+
| vec_to_string(vec_product(vectors.vec_col)) |
+---------------------------------------------+
| [6,6,36]                                    |
+---------------------------------------------+
```

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
