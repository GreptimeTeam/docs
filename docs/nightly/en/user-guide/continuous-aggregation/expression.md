# Expression

## Aggregate functions

This part list all supported aggregate functions in flow:

- `count(column)`: count the number of rows.
- `sum(column)`: sum the values of the column.
- `avg(column)`: calculate the average value of the column.
- `min(column)`: find the minimum value of the column.
- `max(column)`: find the maximum value of the column.

more aggregate fucntions will be added in the future.

## Scalar functions

Flow support most scalar functions from datafusion, see the full list of supported scalar functions in [datafusion](https://docs.greptime.com/reference/sql/functions/df-functions#scalar-functions).

And here are some of the most commonly used scalar functions in flow:

- [`date_bin`](https://docs.greptime.com/reference/sql/functions/df-functions#date-bin): calculate time intervals and returns the start of the interval nearest to the specified timestamp.
- [`date_trunc`](https://docs.greptime.com/reference/sql/functions/df-functions#date-trunc): truncate a timestamp value to a specified precision.
- [`trunc`](https://docs.greptime.com/reference/sql/functions/df-functions#trunc): truncate a number to a whole number or truncated to the specified decimal places.
