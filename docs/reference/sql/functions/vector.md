# Vector Functions

This page lists all vector-related functions supported in GreptimeDB. Vector functions are primarily used for operations such as distance calculation, similarity measurement, and more.

## Distance Calculations

* `l2sq_distance(vec1, vec2)`: Computes the squared L2 distance between two vectors.  
* `cos_distance(vec1, vec2)`: Computes the cosine distance between two vectors.  
* `dot_product(vec1, vec2)`: Computes the dot product of two vectors.  

### Notes:  

The parameters support both vector literals and column values. Vector literals must be enclosed in square brackets `[]` and contain `f32` elements separated by commas, e.g., `[1.0, 2.0, 3.0]`. The dimensions of the vectors involved in the operations must be consistent.

---

### `l2sq_distance`

Calculates the squared Euclidean distance (squared L2 distance) between two vectors. L2 distance is the straight-line distance between two points in geometric space. This function returns the squared value to improve computational efficiency.

Example:

```sql
SELECT l2sq_distance('[1.0, 2.0, 3.0]', '[2.0, 1.0, 4.0]');
```

Details:

* Input: Two vectors with consistent dimensions (as literals or column values).  
* Output: A scalar value of type `f64`.  

---

### `cos_distance`

Calculates the cosine distance between two vectors. Cosine distance measures the cosine of the angle between two vectors and is used to quantify similarity.

Example:

```sql
SELECT cos_distance('[1.0, 2.0, 3.0]', '[2.0, 1.0, 4.0]');
```

Details:

* Input: Two vectors with consistent dimensions (as literals or column values).  
* Output: A scalar value of type `f64`.  

---

### `dot_product`

Computes the dot product of two vectors. The dot product is the sum of the element-wise multiplications of two vectors. It is commonly used to measure similarity or for linear transformations in machine learning.

Example:

```sql
SELECT dot_product('[1.0, 2.0, 3.0]', '[2.0, 1.0, 4.0]');
```

Details:

* Input: Two vectors with consistent dimensions (as literals or column values).  
* Output: A scalar value of type `f64`.  
