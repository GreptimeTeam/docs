`INSERT` ingest selected data to into a table.

# Syntax
Basic syntax of INSERT statement is as follows:
```sql
INSERT INTO TABLE_NAME (column1, column2, column3,...columnN)
VALUES (value1, value2, value3,...valueN);
```
 - Here, column1, column2,...columnN are the names of the columns in the table into which you want to insert data.
 - value1, value2,...valueN are the values to be inserted into the table.

# Examples

```sql
INSERT INTO system_metrics
VALUES
    ("host1", "idc_a", 11.8, 10.3, 10.3, 1667446797460),
    ("host2", "idc_a", 80.1, 70.3, 90.0, 1667446797461),
    ("host1", "idc_b", 50.0, 66.7, 40.6, 1667446797462);

```
