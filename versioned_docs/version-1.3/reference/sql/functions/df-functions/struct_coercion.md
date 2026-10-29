---
title: "Struct Coercion"
description: "Struct Coercion - generated from Apache DataFusion documentation."
keywords: [DataFusion, struct coercion]
unlisted: true
---

### Comparison and Ordering

DataFusion supports comparing `STRUCT` values with standard comparison operators
(`=`, `!=`, `<`, `<=`, `>`, `>=`). Ordering comparisons are lexicographical and
follow DataFusion's default ascending comparison behavior, where `NULL` sorts
before non-`NULL` values.

##### Examples

```sql
SELECT {x: 1, y: 2} < {x: 1, y: 3};
-- true

SELECT {x: 1, y: NULL} < {x: 1, y: 2};
-- true

SELECT {x: 1, y: NULL} = {x: 1, y: NULL};
--true
```
