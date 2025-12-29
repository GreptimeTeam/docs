---
keywords: [SQL functions, DataFusion functions, aggregate functions, scalar functions, window functions]
description: Provides an overview of the SQL functions available in GreptimeDB, including categories and examples of their usage.
---

import TOCInline from '@theme/TOCInline';

# Functions

<TOCInline toc={toc} />

<!--
The outling of this document is a little strange, as the content is classified by company functions and feature functions. We plan to tidy up the content in the future when out functions are more stable.
-->

## Datafusion Functions

Since GreptimeDB's query engine is built based on Apache Arrow DataFusion, GreptimeDB inherits all built-in
functions in DataFusion. These functions include:

* **Aggregate functions**: such as `COUNT`, `SUM`, `MIN`, `MAX`, etc. For a detailed list, please refer to [Aggregate Functions](./df-functions.md#aggregate-functions)
* **Scalar functions**: such as `ABS`, `COS`, `FLOOR`, etc. For a detailed list, please refer to [Scalar Functions](./df-functions.md#scalar-functions)
* **Window functions**: performs a calculation across a set of table rows that are somehow related to the current row. For a detailed list, please refer to [Window Functions](./df-functions.md#window-functions)

To find all the DataFusion functions, please refer to [DataFusion Functions](df-functions.md).

### `arrow_cast`

`arrow_cast` function is from DataFusion's [`arrow_cast`](./df-functions.md#arrow-cast). It's illustrated as:

```sql
arrow_cast(expression, datatype)
```

Where the `datatype` can be any valid Arrow data type in this [list](https://arrow.apache.org/datafusion/user-guide/sql/data_types.html). The four timestamp types are:

- Timestamp(Second, None)
- Timestamp(Millisecond, None)
- Timestamp(Microsecond, None)
- Timestamp(Nanosecond, None)

(Notice that the `None` means the timestamp is timezone naive)

## GreptimeDB Functions

### String Functions

DataFusion [String Function](./df-functions.md#string-functions).

GreptimeDB provides:
* `matches_term(expression, term)` for full text search. For details, read the [Fulltext Search](/user-guide/logs/fulltext-search.md).
* `regexp_extract(str, regexp)` to extract the first substring in a string that matches a regular expression. Returns `NULL` if no match is found.

**MySQL-Compatible String Functions:**

GreptimeDB also provides the following MySQL-compatible string functions:
* `locate(substr, str[, pos])` - Returns the position of the first occurrence of substring
* `elt(N, str1, str2, ...)` - Returns the Nth string from the list
* `field(str, str1, str2, ...)` - Returns the index of the first string that matches
* `insert(str, pos, len, newstr)` - Inserts a substring at a specified position
* `space(N)` - Returns a string of N space characters
* `format(X, D)` - Formats a number with thousand separators and D decimal places

#### regexp_extract

Extracts the first substring in a string that matches a [regular expression](https://docs.rs/regex/latest/regex/#syntax). Returns `NULL` if no match is found.

```sql
regexp_extract(str, regexp)
```

**Arguments:**

- **str**: String expression to operate on. Can be a constant, column, or function, and any combination of operators.
- **regexp**: Regular expression to match against. Can be a constant, column, or function.

**Note on Escaping:**

GreptimeDB's regex escape behavior differs between MySQL and PostgreSQL compatibility modes:
- **MySQL mode**: Requires double backslashes for escape sequences (e.g., `\\d`, `\\s`)
- **PostgreSQL mode**: Single backslashes work by default (e.g., `\d`, `\s`), or use `E''` prefix for consistency with MySQL (e.g., `E'\\d'`)

**Examples:**

```sql
SELECT regexp_extract('version 1.2.3', '\d+\.\d+\.\d+');
-- Returns: 1.2.3

SELECT regexp_extract('Phone: 123-456-7890', '\d{3}-\d{3}-\d{4}');
-- Returns: 123-456-7890

SELECT regexp_extract('no match here', '\d+\.\d+\.\d+');
-- Returns: NULL
```

#### locate

Returns the position of the first occurrence of substring `substr` in string `str`. Optionally, you can specify a starting position `pos`. Returns 0 if the substring is not found.

```sql
locate(substr, str[, pos])
```

**Arguments:**

- **substr**: The substring to search for.
- **str**: The string to search in.
- **pos** (optional): The position to start searching from (1-based). If omitted, searching starts from the beginning.

**Examples:**

```sql
SELECT locate('world', 'hello world');
-- Returns: 7

SELECT locate('o', 'hello world', 6);
-- Returns: 8 (finds the second 'o')

SELECT locate('xyz', 'hello world');
-- Returns: 0 (not found)
```

#### elt

Returns the Nth string from a list of strings. Returns `NULL` if N is less than 1, greater than the number of strings, or `NULL`.

```sql
elt(N, str1, str2, str3, ...)
```

**Arguments:**

- **N**: The index of the string to return (1-based).
- **str1, str2, str3, ...**: The list of strings.

**Examples:**

```sql
SELECT elt(2, 'apple', 'banana', 'cherry');
-- Returns: banana

SELECT elt(0, 'apple', 'banana', 'cherry');
-- Returns: NULL
```

#### field

Returns the index (1-based) of the first string that matches `str` in the list. Returns 0 if no match is found or if `str` is `NULL`.

```sql
field(str, str1, str2, str3, ...)
```

**Arguments:**

- **str**: The string to search for.
- **str1, str2, str3, ...**: The list of strings to search in.

**Examples:**

```sql
SELECT field('banana', 'apple', 'banana', 'cherry');
-- Returns: 2

SELECT field('grape', 'apple', 'banana', 'cherry');
-- Returns: 0 (not found)
```

#### insert

Inserts a substring into a string at a specified position, replacing a specified number of characters.

```sql
insert(str, pos, len, newstr)
```

**Arguments:**

- **str**: The original string.
- **pos**: The position to start inserting (1-based).
- **len**: The number of characters to replace.
- **newstr**: The string to insert.

**Examples:**

```sql
SELECT insert('Quadratic', 3, 4, 'What');
-- Returns: QuWhattic

SELECT insert('Quadratic', 3, 100, 'What');
-- Returns: QuWhat (replaces to end of string)
```

#### space

Returns a string consisting of N space characters.

```sql
space(N)
```

**Arguments:**

- **N**: The number of spaces to return. Returns empty string if N is negative.

**Examples:**

```sql
SELECT space(5);
-- Returns: '     ' (5 spaces)

SELECT concat('hello', space(3), 'world');
-- Returns: 'hello   world'
```

#### format

Formats a number with thousand separators and a specified number of decimal places.

```sql
format(X, D)
```

**Arguments:**

- **X**: The number to format.
- **D**: The number of decimal places (0-30).

**Examples:**

```sql
SELECT format(1234567.891, 2);
-- Returns: 1,234,567.89

SELECT format(1234567.891, 0);
-- Returns: 1,234,568
```

### Math Functions

DataFusion [Math Function](./df-functions.md#math-functions).

GreptimeDB provides:

* `clamp(value, lower, upper)` to restrict a given value between a lower and upper bound:

```sql
SELECT CLAMP(10, 0, 1);

+------------------------------------+
| clamp(Int64(10),Int64(0),Int64(1)) |
+------------------------------------+
|                                  1 |
+------------------------------------+
```

```sql
SELECT CLAMP(0.5, 0, 1)

+---------------------------------------+
| clamp(Float64(0.5),Int64(0),Int64(1)) |
+---------------------------------------+
|                                   0.5 |
+---------------------------------------+
```

* `mod(x, y)` to get the remainder of a number divided by another number:
```sql
SELECT mod(18, 4);

+-------------------------+
| mod(Int64(18),Int64(4)) |
+-------------------------+
|                       2 |
+-------------------------+
```

### Date and Time Functions

DataFusion [Time and Date Function](./df-functions.md#time-and-date-functions).
GreptimeDB provides:

* [date_add](#data_add)
* [date_sub](#data_sub)
* [date_format](#date_format)
* [to_unixtime](#to_unixtime)
* [timezone](#timezone)

#### date_add

*  `date_add(expression, interval)` to add an interval value to Timestamp, Date, or DateTime

```sql
SELECT date_add('2023-12-06'::DATE, '3 month 5 day');
```

```
+----------------------------------------------------+
| date_add(Utf8("2023-12-06"),Utf8("3 month 5 day")) |
+----------------------------------------------------+
| 2024-03-11                                         |
+----------------------------------------------------+
```

#### data_sub

* `date_sub(expression, interval)` to subtract an interval value to Timestamp, Date, or DateTime

```sql
SELECT date_sub('2023-12-06 07:39:46.222'::TIMESTAMP_MS, '5 day'::INTERVAL);
```

```
+-----------------------------------------------------------------------------------------------------------------------------------------+
| date_sub(arrow_cast(Utf8("2023-12-06 07:39:46.222"),Utf8("Timestamp(Millisecond, None)")),IntervalMonthDayNano("92233720368547758080")) |
+-----------------------------------------------------------------------------------------------------------------------------------------+
| 2023-12-01 07:39:46.222000                                                                                                              |
+-----------------------------------------------------------------------------------------------------------------------------------------+
```

#### date_format

* `date_format(expression, fmt)` to format Timestamp, Date, or DateTime into string by the format:

Supports `Date32`, `Date64`, and all `Timestamp` types.

```sql
SELECT date_format('2023-12-06 07:39:46.222'::TIMESTAMP, '%Y-%m-%d %H:%M:%S:%3f');
```

```
+-----------------------------------------------------------------------------------------------------------------------------+
| date_format(arrow_cast(Utf8("2023-12-06 07:39:46.222"),Utf8("Timestamp(Millisecond, None)")),Utf8("%Y-%m-%d %H:%M:%S:%3f")) |
+-----------------------------------------------------------------------------------------------------------------------------+
| 2023-12-06 07:39:46:222                                                                                                     |
+-----------------------------------------------------------------------------------------------------------------------------+
```

Supported specifiers refer to the [chrono::format::strftime](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) module.

#### to_unixtime

* `to_unixtime(expression)` to convert the expression into the Unix timestamp in seconds. The argument can be integers (Unix timestamp in milliseconds), Timestamp, Date, DateTime, or String. If the argument is the string type, the function will first try to convert it into a DateTime, Timestamp, or Date.

```sql
select to_unixtime('2023-03-01T06:35:02Z');
```

```
+-------------------------------------------+
| to_unixtime(Utf8("2023-03-01T06:35:02Z")) |
+-------------------------------------------+
|                                1677652502 |
+-------------------------------------------+
```

```sql
select to_unixtime('2023-03-01'::date);
```

```
+---------------------------------+
| to_unixtime(Utf8("2023-03-01")) |
+---------------------------------+
|                      1677628800 |
+---------------------------------+
```

#### timezone

* `timezone()` to retrieve the current session timezone:

```sql
select timezone();
```

```
+------------+
| timezone() |
+------------+
| UTC        |
+------------+
```

### System Functions

* `isnull(expression)` to check whether an expression is `NULL`:
```sql
 SELECT isnull(1);

 +------------------+
| isnull(Int64(1)) |
+------------------+
|                0 |
+------------------+
```

```sql
SELECT isnull(NULL);

+--------------+
| isnull(NULL) |
+--------------+
|            1 |
+--------------+
```


* `build()` retrieves the GreptimeDB build info.
* `version()` retrieves the GreptimeDB version.
* `database()` retrieves the current session database:

```sql
select database();

+------------+
| database() |
+------------+
| public     |
+------------+
```

### Admin Functions

GreptimeDB provides `ADMIN` statement to run the administration functions, please refer to [ADMIN](/reference/sql/admin.md) reference.

### JSON Functions

GreptimeDB provide functions for jsons. [Learn more about these functions](./json.md)

### Geospatial Functions

GreptimeDB provide functions for geo-index, trajectory analytics. [Learn more
about these functions](./geo.md)

### Vector Functions

GreptimeDB supports vector functions for vector operations, such as distance calculation, similarity measurement, etc. [Learn more about these functions](./vector.md)

### Approximate Functions

GreptimeDB supports some approximate functions for data analysis, such as approximate count distinct(hll), approximate quantile(uddsketch), etc. [Learn more about these functions](./approximate.md)
