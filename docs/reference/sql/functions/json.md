---
keywords: [JSON functions, JSON conversion, JSON extraction, JSON validation, SQL functions]
description: Lists and describes JSON functions available in GreptimeDB, including their usage and examples.
---

# JSON Functions (Experimental)

This page describes GreptimeDB functions for constructing, converting, and extracting JSON values.

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

## Construction

`json_object(key, value [, key, value ...])` builds a JSON object and returns it as JSONB. Keys are converted to strings and cannot be NULL. Values can be strings, integers, floating-point numbers, booleans, or NULL; cast other types to a supported type first. With duplicate keys, the last value is retained. Calling `json_object()` without arguments returns an empty object.

```sql
SELECT json_to_string(json_object('host', 'web-1', 'cpu', 0.42, 'healthy', true));
```

## Extraction

Extracts values with specific types from JSON values through specific paths.

* `json_get_bool(json, path)` to extract a boolean value from a JSON value by the path.
* `json_get_int(json, path)` to extract an integer value from a JSON value by the path, while boolean values will be converted to integers.
* `json_get_float(json, path)` to extract a float value from a JSON value by the path, while integer and boolean values will be converted to floats.
* `json_get_string(json, path)` to extract a string value from a JSON value by the path. All valid JSON values will be converted to strings, including null values, objects and arrays.
* `json_get_object(json, path)` to extract an object value from a JSON value by the path. Returns NULL if the path does not point to an object.
* `json_get(json, path)` to extract a value as a string. Cast the function result to extract a scalar with another SQL type, for example `json_get(value, 'a')::INT`.
* `json_object_keys(json)` to return the outermost keys of a JSON object as a string list. Returns `[]` for an empty object and `NULL` for non-object JSON values or `NULL` input.

The `path` argument to `json_get` must be a string literal. The return value is NULL when the path does not select a value or the selected value cannot be converted to the requested type.

`path` is a string that selects elements from a JSON value. The following path operators are supported:

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

SELECT json_get(parse_json('{"a": 3}'), 'a')::INT;

SELECT json_to_string(json_get_object(parse_json('{"a": {"b": {"c": {"d": 42}}}}'), 'a.b.c'));

+---------------------------------------------------------------------------------------------------+
| json_to_string(json_get_object(parse_json(Utf8("{"a": {"b": {"c": {"d": 42}}}}")),Utf8("a.b.c"))) |
+---------------------------------------------------------------------------------------------------+
| {"d":42}                                                                                          |
+---------------------------------------------------------------------------------------------------+

SELECT json_object_keys(parse_json('{"a": 1, "b": {"c": 2}}'));

+---------------------------------------------------------------+
| json_object_keys(parse_json(Utf8("{"a": 1, "b": {"c": 2}}"))) |
+---------------------------------------------------------------+
| [a, b]                                                        |
+---------------------------------------------------------------+

SELECT json_object_keys(parse_json('{}'));

+------------------------------------------+
| json_object_keys(parse_json(Utf8("{}"))) |
+------------------------------------------+
| []                                       |
+------------------------------------------+
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

* `json_path_match(json, path)` to check whether a JSON value matches the predicate in the specified JSON path expression. Only predicate expressions are supported.

If the path is invalid or does not evaluate to a predicate, the function will return a `NULL` value.

If the JSON value is `NULL`, the function will return a `NULL` value.

```sql
SELECT json_path_match(parse_json('{"a": 1, "b": 2}'), '$.a == 1');

+------------------------------------------------------------------------+
| json_path_match(parse_json(Utf8("{"a": 1, "b": 2}")),Utf8("$.a == 1")) |
+------------------------------------------------------------------------+
|                                                                      1 |
+------------------------------------------------------------------------+

SELECT json_path_match(parse_json('{"a":1,"b":[1,2,3]}'), '$.b[1 to last] >= 2');

+--------------------------------------------------------------------------------------+
| json_path_match(parse_json(Utf8("{"a":1,"b":[1,2,3]}")),Utf8("$.b[1 to last] >= 2")) |
+--------------------------------------------------------------------------------------+
|                                                                                    1 |
+--------------------------------------------------------------------------------------+

SELECT json_path_match(parse_json('{"a":1,"b":[1,2,3]}'), '$.b[0] > 1');

+-----------------------------------------------------------------------------+
| json_path_match(parse_json(Utf8("{"a":1,"b":[1,2,3]}")),Utf8("$.b[0] > 1")) |
+-----------------------------------------------------------------------------+
|                                                                           0 |
+-----------------------------------------------------------------------------+
```
