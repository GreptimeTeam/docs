# WHERE

`WHERE` 子句允许通过指定条件过滤数据。

## Syntax

```sql
SELECT *
FROM table_name
WHERE condition;
```

如果有 `WHERE` 子句，则它必须为布尔类型的表达式，这通常是带有比较和逻辑运算符的表达式。此表达式计算结果为 false 的行将会从进一步的转换或结果中排除。

## 示例

### 逻辑运算符

支持 `AND`、`OR` 作为逻辑运算符，并可以使用括号（）组合条件。

```sql
SELECT * FROM system_metrics
WHERE idc = 'idc0' AND (host = 'host1' OR host = 'host2');
```

### 数字

支持 `=`, `!=`, `>`, `>=`, `<`, `<=` 作为比较运算符。

```sql
SELECT * FROM system_metrics WHERE cpu_util = 20.0;
SELECT * FROM system_metrics WHERE cpu_util != 20.0;
SELECT * FROM system_metrics WHERE cpu_util > 20.0;
SELECT * FROM system_metrics WHERE cpu_util >= 20.0;
SELECT * FROM system_metrics WHERE cpu_util < 20.0;
SELECT * FROM system_metrics WHERE cpu_util <= 20.0;
```

### List 查找

List 子元素的匹配或不匹配。

### List 匹配

```sql
SELECT * FROM system_metrics WHERE idc IN ('idc_a', 'idc_b');
```

### List 不匹配

```sql
SELECT * FROM system_metrics WHERE idc NOT IN ('idc_a', 'idc_b');
```
