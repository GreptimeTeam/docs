The `CAST` is used to convert an expression of one data type to another. 

# Syntax

```sql
CAST (expression AS data_type)
```

# Parameters:

 - expression: The expression to be converted.
 - data_type: The data type to convert the expression to.

 # Examples

 Convert a string to an integer:

 ```sql
 SELECT CAST('123' AS INT) ;
 ```

+-------------+
| Utf8("123") |
+-------------+
|         123 |
+-------------+
