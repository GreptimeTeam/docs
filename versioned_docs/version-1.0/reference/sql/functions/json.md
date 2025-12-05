---
keywords: [JSON functions, JSON conversion, JSON extraction, JSON validation, SQL functions]
description: Lists and describes JSON functions available in GreptimeDB, including their usage and examples.
---

# JSON Functions (Experimental)

This page lists all json type related functions in GreptimeDB.

:::warning
The JSON feature is currently experimental and may change in future releases.
:::

## Conversion

Conversion between JSON and other types.

* `parse_json(string)` to parse a JSON string into a JSON value. Illegal JSON strings will return an error.
* `json_to_string(json)` to convert a JSON value to a string.

```sql
SELECT json_to_string(parse_json('{"a": 1, "b": 2}'));

+----------------------------------------------------------+
| json_to_string(parse_json(Utf8("{\"a\": 1, \"b\": 2}"))) |
+----------------------------------------------------------+
| {"a":1,"b":2}                                            |
+----------------------------------------------------------+
```

## Extraction

Extracts values with specific types from JSON values through specific paths.

* `json_get_bool(json, path)` to extract a boolean value from a JSON value by the path.
* `json_get_int(json, path)` to extract an integer value from a JSON value by the path, while boolean values will be converted to integers.
* `json_get_float(json, path)` to extract a float value from a JSON value by the path, while integer and boolean values will be converted to floats.
* `json_get_string(json, path)` to extract a string value from a JSON value by the path. All valid JSON values will be converted to strings, including null values, objects and arrays.
* `json_get_object(json, path)` to extract an object value from a JSON value by the path. Returns NULL if the path does not point to an object.

`path` is a string that select and extract elements from a json value. The following operators in the path are supported:

| Operator                 | Description                                                  | Examples           |
| ------------------------ | ------------------------------------------------------------ | ------------------ |
| `$`                      | The root element                                             | `$`                |
| `@`                      | The current element in the filter expression                 | `$.event?(@ == 1)` |
| `.*`                     | Selecting all elements in an Object                          | `$.*`              |
| `.<name>`                | Selecting element that match the name in an Object           | `$.event`          |
| `:<name>`                | Alias of `.<name>`                                           | `$:event`          |
| `["<name>"]`             | Alias of `.<name>`                                           | `$["event"]`       |
| `[*]`                    | Selecting all elements in an Array                           | `$[*]`             |
| `[<pos>, ..]`            | Selecting 0-based `n-th` elements in an Array                | `$[1, 2]`          |
| `[last - <pos>, ..]`     | Selecting `n-th` element before the last element in an Array | `$[0, last - 1]`   |
| `[<pos1> to <pos2>, ..]` | Selecting all elements of a range in an Array                | `$[1 to last - 2]` |
| `?(<expr>)`              | Selecting all elements that matched the filter expression    | `$?(@.price < 10)` |

If the path is invalid, the function will return a NULL value.

```sql
SELECT json_get_int(parse_json('{"a": {"c": 3}, "b": 2}'), 'a.c');

+-----------------------------------------------------------------------+
| json_get_int(parse_json(Utf8("{"a": {"c": 3}, "b": 2}")),Utf8("a.c")) |
+-----------------------------------------------------------------------+
|                                                                     3 |
+-----------------------------------------------------------------------+

SELECT json_to_string(json_get_object(parse_json('{"a": {"b": {"c": {"d": 42}}}}'), 'a.b.c'));

+---------------------------------------------------------------------------------------------------+
| json_to_string(json_get_object(parse_json(Utf8("{"a": {"b": {"c": {"d": 42}}}}")),Utf8("a.b.c"))) |
+---------------------------------------------------------------------------------------------------+
| {"d":42}                                                                                          |
+---------------------------------------------------------------------------------------------------+
```

## Validation

Check the type of a JSON value.

* `json_is_null(json)` to check whether a JSON value is a null value.
* `json_is_bool(json)` to check whether a JSON value is a boolean value.
* `json_is_int(json)` to check whether a JSON value is an integer value.
* `json_is_float(json)` to check whether a JSON value is a float value.
* `json_is_string(json)` to check whether a JSON value is a string value.
* `json_is_object(json)` to check whether a JSON value is an object value.
* `json_is_array(json)` to check whether a JSON value is an array value.

```sql
SELECT json_is_array(parse_json('[1, 2, 3]'));

+----------------------------------------------+
| json_is_array(parse_json(Utf8("[1, 2, 3]"))) |
+----------------------------------------------+
|                                            1 |
+----------------------------------------------+

SELECT json_is_object(parse_json('1'));

+---------------------------------------+
| json_is_object(parse_json(Utf8("1"))) |
+---------------------------------------+
|                                     0 |
+---------------------------------------+
```

* `json_path_exists(json, path)` to check whether a path exists in a JSON value.

If the path is invalid, the function will return an error.

If the path or the JSON value is `NULL`, the function will return a `NULL` value.

```sql
SELECT json_path_exists(parse_json('{"a": 1, "b": 2}'), 'a');

+------------------------------------------------------------------+
| json_path_exists(parse_json(Utf8("{"a": 1, "b": 2}")),Utf8("a")) |
+------------------------------------------------------------------+
|                                                                1 |
+------------------------------------------------------------------+

SELECT json_path_exists(parse_json('{"a": 1, "b": 2}'), 'c.d');

+--------------------------------------------------------------------+
| json_path_exists(parse_json(Utf8("{"a": 1, "b": 2}")),Utf8("c.d")) |
+--------------------------------------------------------------------+
|                                                                  0 |
+--------------------------------------------------------------------+

SELECT json_path_exists(parse_json('{"a": 1, "b": 2}'), NULL);

+-------------------------------------------------------------+
| json_path_exists(parse_json(Utf8("{"a": 1, "b": 2}")),NULL) |
+-------------------------------------------------------------+
|                                                        NULL |
+-------------------------------------------------------------+
```
