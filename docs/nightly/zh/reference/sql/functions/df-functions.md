# DataFusion 函数

这个页面生成自 Apache DataFusion 项目的文档：

  * [DataFusion 标量函数](https://raw.githubusercontent.com/apache/datafusion/main/docs/source/user-guide/sql/scalar_functions.md)
  * [DataFusion 聚合函数](https://raw.githubusercontent.com/apache/datafusion/main/docs/source/user-guide/sql/aggregate_functions.md)
  * [DataFusion 窗口函数](https://raw.githubusercontent.com/apache/datafusion/main/docs/source/user-guide/sql/window_functions.md)

<!---
  Licensed to the Apache Software Foundation (ASF) under one
  or more contributor license agreements.  See the NOTICE file
  distributed with this work for additional information
  regarding copyright ownership.  The ASF licenses this file
  to you under the Apache License, Version 2.0 (the
  "License"); you may not use this file except in compliance
  with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing,
  software distributed under the License is distributed on an
  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, either express or implied.  See the License for the
  specific language governing permissions and limitations
  under the License.
-->

## 标量函数

### 数学函数

- [abs](#abs)
- [acos](#acos)
- [acosh](#acosh)
- [asin](#asin)
- [asinh](#asinh)
- [atan](#atan)
- [atanh](#atanh)
- [atan2](#atan2)
- [cbrt](#cbrt)
- [ceil](#ceil)
- [cos](#cos)
- [cosh](#cosh)
- [degrees](#degrees)
- [exp](#exp)
- [factorial](#factorial)
- [floor](#floor)
- [gcd](#gcd)
- [isnan](#isnan)
- [iszero](#iszero)
- [lcm](#lcm)
- [ln](#ln)
- [log](#log)
- [log10](#log10)
- [log2](#log2)
- [nanvl](#nanvl)
- [pi](#pi)
- [power](#power)
- [pow](#pow)
- [radians](#radians)
- [random](#random)
- [round](#round)
- [signum](#signum)
- [sin](#sin)
- [sinh](#sinh)
- [sqrt](#sqrt)
- [tan](#tan)
- [tanh](#tanh)
- [trunc](#trunc)
##### `abs`

返回一个数的绝对值。

```
abs(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `acos`

返回一个数的反余弦或反余弦。

```
acos(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `acosh`

返回一个数的反双曲余弦或反双曲余弦。

```
acosh(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `asin`

返回一个数的反正弦或反正弦。

```
asin(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `asinh`

返回一个数的反双曲正弦或反双曲正弦。

```
asinh(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `atan`

返回一个数的反正切或反正切。

```
atan(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `atanh`

返回一个数的反双曲正切或反双曲正切。

```
atanh(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `atan2`

返回 `expression_y / expression_x` 的反正切或反正切。

```
atan2(expression_y, expression_x)
```

###### 参数

- **expression_y**: 要操作的第一个数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。
- **expression_x**: 要操作的第二个数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。


##### `cbrt`

返回一个数的立方根。

```
cbrt(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `ceil`

返回大于或等于一个数的最近整数。

```
ceil(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `cos`

返回一个数的余弦值。

```
cos(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `cosh`

返回一个数的双曲余弦值。

```
cosh(numeric_expression)
```

##### `degrees`

将弧度转换为角度。

```
degrees(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `exp`

返回一个数的以 e 为底的指数值。

```
exp(numeric_expression)
```

###### 参数

- **numeric_expression**: 作为指数的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `factorial`

阶乘。如果值小于 2，则返回 1。

```
factorial(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `floor`

返回小于或等于一个数的最近整数。

```
floor(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `gcd`

返回 `expression_x` 和 `expression_y` 的最大公约数。如果两个输入都为零，则返回 0。

```
gcd(expression_x, expression_y)
```

###### 参数

- **expression_x**: 要操作的第一个数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。
- **expression_y**: 要操作的第二个数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `isnan`

如果给定的数是 +NaN 或 -NaN，则返回 true；否则返回 false。

```
isnan(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `iszero`

如果给定的数是 +0.0 或 -0.0，则返回 true；否则返回 false。

```
iszero(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `lcm`

返回 `expression_x` 和 `expression_y` 的最小公倍数。如果任一输入为零，则返回 0。

```
lcm(expression_x, expression_y)
```

###### 参数

- **expression_x**: 要操作的第一个数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。
- **expression_y**: 要操作的第二个数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `ln`

返回一个数的自然对数。

```
ln(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `log`

返回一个数的以指定底数为底的对数值。
如果省略底数，则取以 10 为底的对数。

```
log(base, numeric_expression)
log(numeric_expression)
```

###### 参数

- **base**: 要操作的底数表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。
- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `log10`

返回一个数的以 10 为底的对数值。

```
log10(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `log2`

返回一个数的以 2 为底的对数值。

```
log2(numeric_expression)
```

###### 参数

- **numeric_expression**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `nanvl`

如果第一个参数不是 _NaN_，则返回第一个参数。
否则返回第二个参数。

```
nanvl(expression_x, expression_y)
```

###### 参数

- **expression_x**: 如果不是 _NaN_，则返回的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。
- **expression_y**: 如果第一个表达式是 _NaN_，则返回的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `pi`

返回 π 的近似值。

```
pi()
```

##### `power`

返回一个基数表达式的指数幂。

```
power(base, exponent)
```

###### 参数

- **base**: 要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。
- **exponent**: 要操作的指数数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

###### 别名

- pow
##### `pow`

_别名：[power](#power)。_

##### `radians`

将角度转换为弧度。

```
radians(numeric_expression)
```

###### 参数

- **numeric_expression**：要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `random`

返回一个在范围 [0, 1) 内的随机浮点数。
每行的随机种子是唯一的。

```
random()
```

##### `round`

将一个数四舍五入到最近的整数。

```
round(numeric_expression[, decimal_places])
```

###### 参数

- **numeric_expression**：要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。
- **decimal_places**：可选。要四舍五入到的小数位数。
  默认为 0。

##### `signum`

返回一个数的符号。
负数返回 `-1`。
零和正数返回 `1`。

```
signum(numeric_expression)
```

###### 参数

- **numeric_expression**：要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `sin`

返回一个数的正弦值。

```
sin(numeric_expression)
```

###### 参数

- **numeric_expression**：要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `sinh`

返回一个数的双曲正弦值。

```
sinh(numeric_expression)
```

###### 参数

- **numeric_expression**：要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `sqrt`

返回一个数的平方根。

```
sqrt(numeric_expression)
```

###### 参数

- **numeric_expression**：要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `tan`

返回一个数的正切值。

```
tan(numeric_expression)
```

###### 参数

- **numeric_expression**：要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `tanh`

返回一个数的双曲正切值。

```
tanh(numeric_expression)
```

###### 参数

- **numeric_expression**：要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `trunc`

将一个数截断为整数或截断到指定的小数位数。

```
trunc(numeric_expression[, decimal_places])
```

###### 参数

- **numeric_expression**：要操作的数值表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

- **decimal_places**：可选。要截断到的小数位数。
  默认为 0（截断为整数）。如果 `decimal_places` 是正整数，则截断小数点右侧的数字。如果 `decimal_places` 是负整数，则用 `0` 替换小数点左侧的数字。

### 条件函数

- [coalesce](#coalesce)
- [nullif](#nullif)
- [nvl](#nvl)
- [nvl2](#nvl2)
- [ifnull](#ifnull)

##### `coalesce`

返回其参数中第一个非 _null_ 的值。
如果所有参数都为 _null_，则返回 _null_。
该函数通常用于替换 _null_ 值的默认值。

```
coalesce(expression1[, ..., expression_n])
```

###### 参数

- **expression1, expression_n**：
  如果前面的表达式为 _null_，则使用的表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。
  根据需要传递多个表达式参数。

##### `nullif`

如果 _expression1_ 等于 _expression2_，则返回 _null_；否则返回 _expression1_。
这可以用来执行 [`coalesce`](#coalesce) 的反向操作。

```
nullif(expression1, expression2)
```

###### 参数

- **expression1**：要比较并在等于 expression2 时返回的表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。
- **expression2**：要与 expression1 进行比较的表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `nvl`

如果 _expression1_ 为 NULL，则返回 _expression2_；否则返回 _expression1_。

```
nvl(expression1, expression2)
```

###### 参数

- **expression1**：如果 expression1 不为 NULL，则返回的表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。
- **expression2**：如果 expression1 为 NULL，则返回的表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `nvl2`

如果 _expression1_ 不为 NULL，则返回 _expression2_；否则返回 _expression3_。

```
nvl2(expression1, expression2, expression3)
```

###### 参数

- **expression1**：条件表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。
- **expression2**：如果 expression1 不为 NULL，则返回的表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。
- **expression3**：如果 expression1 为 NULL，则返回的表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `ifnull`

_别名：[nvl](#nvl)。_

### 字符串函数

- [ascii](#ascii)
- [bit_length](#bit-length)
- [btrim](#btrim)
- [char_length](#char-length)
- [character_length](#character-length)
- [concat](#concat)
- [concat_ws](#concat-ws)
- [chr](#chr)
- [ends_with](#ends-with)
- [initcap](#initcap)
- [instr](#instr)
- [left](#left)
- [length](#length)
- [lower](#lower)
- [lpad](#lpad)
- [ltrim](#ltrim)
- [octet_length](#octet-length)
- [repeat](#repeat)
- [replace](#replace)
- [reverse](#reverse)
- [right](#right)
- [rpad](#rpad)
- [rtrim](#rtrim)
- [split_part](#split-part)
- [starts_with](#starts-with)
- [strpos](#strpos)
- [substr](#substr)
- [to_hex](#to-hex)
- [translate](#translate)
- [trim](#trim)
- [upper](#upper)
- [uuid](#uuid)
- [overlay](#overlay)
- [levenshtein](#levenshtein)
- [substr_index](#substr-index)
- [find_in_set](#find-in-set)
- [position](#position)
- [contains](#contains)
##### `ascii`

返回字符串中第一个字符的 ASCII 值。

```
ascii(str)
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。

**相关函数**：
[chr](#chr)

##### `bit_length`

返回字符串的位长度。

```
bit_length(str)
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。

**相关函数**：
[length](#length),
[octet_length](#octet-length)

##### `btrim`

从字符串的开头和结尾删除指定的修剪字符串。
如果未提供修剪字符串，则从输入字符串的开头和结尾删除所有空格。

```
btrim(str[, trim_str])
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **trim_str**：要从输入字符串的开头和结尾修剪的字符串表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。
  _默认为空格字符。_

**相关函数**：
[ltrim](#ltrim),
[rtrim](#rtrim)

###### 别名

- trim

##### `char_length`

[长度](#length)的别名。

##### `character_length`

[长度](#length)的别名。

##### `concat`

将多个字符串连接在一起。

```
concat(str[, ..., str_n])
```

###### 参数

- **str**：要连接的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **str_n**：要连接的后续字符串列或文字字符串。

**相关函数**：
[concat_ws](#concat-ws)

##### `concat_ws`

使用指定的分隔符将多个字符串连接在一起。

```
concat(separator, str[, ..., str_n])
```

###### 参数

- **separator**：要插入在连接的字符串之间的分隔符。
- **str**：要连接的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **str_n**：要连接的后续字符串列或文字字符串。

**相关函数**：
[concat](#concat)

##### `chr`

返回具有指定 ASCII 或 Unicode 代码值的字符。

```
chr(expression)
```

###### 参数

- **expression**：包含要操作的 ASCII 或 Unicode 代码值的表达式。
  可以是常量、列或函数，以及任意组合的算术或字符串运算符。

**相关函数**：
[ascii](#ascii)

##### `ends_with`

测试字符串是否以子字符串结尾。

```
ends_with(str, substr)
```

###### 参数

- **str**：要测试的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **substr**：要测试的子字符串。

##### `initcap`

将输入字符串中每个单词的首字母大写。
单词由非字母数字字符分隔。

```
initcap(str)
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。

**相关函数**：
[lower](#lower),
[upper](#upper)

##### `instr`

[strpos](#strpos)的别名。

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **substr**：要搜索的子字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。

##### `left`

从字符串的左侧返回指定数量的字符。

```
left(str, n)
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **n**：要返回的字符数。

**相关函数**：
[right](#right)

##### `length`

返回字符串中的字符数。

```
length(str)
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。

###### 别名

- char_length
- character_length

**相关函数**：
[bit_length](#bit-length),
[octet_length](#octet-length)

##### `lower`

将字符串转换为小写。

```
lower(str)
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。

**相关函数**：
[initcap](#initcap),
[upper](#upper)

##### `lpad`

使用另一个字符串在字符串的左侧填充到指定的字符串长度。

```
lpad(str, n[, padding_str])
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **n**：要填充到的字符串长度。
- **padding_str**：要填充的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
  _默认为空格。_

**相关函数**：
[rpad](#rpad)

##### `ltrim`

从字符串的开头删除指定的修剪字符串。
如果未提供修剪字符串，则从输入字符串的开头删除所有空格。

```
ltrim(str[, trim_str])
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **trim_str**：要从输入字符串的开头修剪的字符串表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。
  _默认为空格字符。_

**相关函数**：
[btrim](#btrim),
[rtrim](#rtrim)

##### `octet_length`

返回字符串的字节长度。

```
octet_length(str)
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。

**相关函数**：
[bit_length](#bit-length),
[length](#length)

##### `repeat`

返回一个重复指定次数的输入字符串的字符串。

```
repeat(str, n)
```

###### 参数

- **str**：要重复的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **n**：要重复输入字符串的次数。

##### `replace`

将字符串中所有出现的指定子字符串替换为新的子字符串。

```
replace(str, substr, replacement)
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **substr**：要替换的子字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **replacement**：替换的子字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。

##### `reverse`

反转字符串的字符顺序。

```
reverse(str)
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。

##### `right`

从字符串的右侧返回指定数量的字符。

```
right(str, n)
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **n**：要返回的字符数。

**相关函数**：
[left](#left)

##### `rpad`

使用另一个字符串在字符串的右侧填充到指定的字符串长度。

```
rpad(str, n[, padding_str])
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **n**：要填充到的字符串长度。
- **padding_str**：要填充的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
  _默认为空格。_

**相关函数**：
[lpad](#lpad)

##### `rtrim`

从字符串的末尾删除指定的修剪字符串。
如果未提供修剪字符串，则从输入字符串的末尾删除所有空格。

```
rtrim(str[, trim_str])
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **trim_str**：要从输入字符串的末尾修剪的字符串表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。
  _默认为空格字符。_

**相关函数**：
[btrim](#btrim),
[ltrim](#ltrim)

##### `split_part`

根据指定的分隔符拆分字符串，并返回指定位置的子字符串。

```
split_part(str, delimiter, pos)
```

###### 参数

- **str**：要拆分的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **delimiter**：要拆分的字符串或字符。
- **pos**：要返回的部分的位置。

##### `starts_with`

测试字符串是否以子字符串开头。

```
starts_with(str, substr)
```

###### 参数

- **str**：要测试的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **substr**：要测试的子字符串。

##### `strpos`

返回字符串中指定子字符串的起始位置。
位置从1开始。
如果字符串中不存在子字符串，则函数返回0。

```
strpos(str, substr)
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **substr**：要搜索的子字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。

###### 别名

- instr

##### `substr`

从字符串的指定起始位置提取指定数量的字符的子字符串。

```
substr(str, start_pos[, length])
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **start_pos**：子字符串的起始位置。
  字符串中的第一个字符的位置为1。
- **length**：要提取的字符数。
  如果未指定，则返回起始位置之后的剩余字符串。

###### 别名

- substring

##### `substring`

[substr](#substr)的别名。

##### `translate`

将字符串中的字符转换为指定的转换字符。

```
translate(str, chars, translation)
```

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **chars**：要转换的字符。
- **translation**：转换字符。转换字符仅替换 **chars** 字符串中相同位置的字符。

##### `to_hex`

将整数转换为十六进制字符串。

```
to_hex(int)
```

###### 参数

- **int**：要转换的整数表达式。
  可以是常量、列或函数，以及任意组合的算术运算符。

##### `trim`

[btrim](#btrim)的别名。

##### `upper`

将字符串转换为大写。

```
upper(str)
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。

**相关函数**：
[initcap](#initcap),
[lower](#lower)

##### `uuid`

返回每行唯一的UUID v4字符串值。

```
uuid()
```

##### `overlay`

返回从指定位置和指定计数长度替换的字符串。
例如，`overlay('Txxxxas' placing 'hom' from 2 for 4) → Thomas`

```
overlay(str PLACING substr FROM pos [FOR count])
```

###### 参数

- **str**：要操作的字符串表达式。
- **substr**：要替换str的字符串。
- **pos**：要替换str的起始位置。
- **count**：要替换的字符数。如果未指定，则使用substr的长度。

##### `levenshtein`

返回两个给定字符串之间的Levenshtein距离。
例如，`levenshtein('kitten', 'sitting') = 3`

```
levenshtein(str1, str2)
```

###### 参数

- **str1**：要计算与str2的Levenshtein距离的字符串表达式。
- **str2**：要计算与str1的Levenshtein距离的字符串表达式。

##### `substr_index`

返回在delim定界符之前的str子字符串。
如果count为正数，则返回最后一个定界符左侧的所有内容。
如果count为负数，则返回最后一个定界符右侧的所有内容。
例如，`substr_index('www.apache.org', '.', 1) = www`，`substr_index('www.apache.org', '.', -1) = org`

```
substr_index(str, delim, count)
```

###### 参数

- **str**：要操作的字符串表达式。
- **delim**：要在str中查找并拆分str的字符串。
- **count**：要搜索定界符的次数。可以是正数或负数。

##### `find_in_set`

如果字符串str在由N个子字符串组成的字符串列表strlist中，则返回1到N之间的值。
例如，`find_in_set('b', 'a,b,c,d') = 2`

```
find_in_set(str, strlist)
```

###### 参数

- **str**：要在strlist中查找的字符串表达式。
- **strlist**：字符串列表是由逗号字符分隔的子字符串组成的字符串。

### 二进制字符串函数

- [decode](#decode)
- [encode](#encode)

##### `encode`

将二进制数据编码为文本表示。

```
encode(expression, format)
```

###### 参数

- **expression**：包含字符串或二进制数据的表达式。

- **format**：支持的格式有：`base64`，`hex`

**相关函数**：
[decode](#decode)

##### `decode`

从字符串中解码二进制数据的文本表示。

```
decode(expression, format)
```

###### 参数

- **expression**：包含编码的字符串数据的表达式。

- **format**：与[encode](#encode)相同的参数

**相关函数**：
[encode](#encode)

### 正则表达式函数

Apache DataFusion使用类似于[PCRE]的正则表达式[语法]
（减去了对几个功能的支持，包括环视和反向引用）。
支持以下正则表达式函数：

- [regexp_like](#regexp-like)
- [regexp_match](#regexp-match)
- [regexp_replace](#regexp-replace)

[pcre]: https://en.wikibooks.org/wiki/Regular_Expressions/Perl-Compatible_Regular_Expressions
[语法]: https://docs.rs/regex/latest/regex/#syntax

##### `regexp_like`

如果字符串中的[正则表达式]至少有一个匹配项，则返回true，否则返回false。

[正则表达式]: https://docs.rs/regex/latest/regex/#syntax

```
regexp_like(str, regexp[, flags])
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **regexp**：要与字符串表达式进行匹配的正则表达式。
  可以是常量、列或函数。
- **flags**：可选的正则表达式标志，用于控制正则表达式的行为。支持以下标志：
  - **i**：不区分大小写：字母匹配大写和小写
  - **m**：多行模式：^和$匹配行的开头和结尾
  - **s**：允许.匹配\n
  - **R**：启用CRLF模式：当启用多行模式时，使用\r\n
  - **U**：交换x*和x*的含义？

###### 示例

```sql
select regexp_like('Köln', '[a-zA-Z]ö[a-zA-Z]{2}');
+--------------------------------------------------------+
| regexp_like(Utf8("Köln"),Utf8("[a-zA-Z]ö[a-zA-Z]{2}")) |
+--------------------------------------------------------+
| true                                                   |
+--------------------------------------------------------+
SELECT regexp_like('aBc', '(b|d)', 'i');
+--------------------------------------------------+
| regexp_like(Utf8("aBc"),Utf8("(b|d)"),Utf8("i")) |
+--------------------------------------------------+
| true                                             |
+--------------------------------------------------+
```

更多示例可以在[这里](https://github.com/apache/datafusion/blob/main/datafusion-examples/examples/regexp.rs)找到

##### `regexp_match`

返回字符串中与[正则表达式](https://docs.rs/regex/latest/regex/#syntax)匹配的列表。

```
regexp_match(str, regexp[, flags])
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **regexp**：要与之匹配的正则表达式。
  可以是常量、列或函数。
- **flags**：可选的正则表达式标志，用于控制正则表达式的行为。支持以下标志：
  - **i**：不区分大小写：字母匹配大写和小写
  - **m**：多行模式：^和$匹配行的开头和结尾
  - **s**：允许.匹配\n
  - **R**：启用CRLF模式：当启用多行模式时，使用\r\n
  - **U**：交换x*和x*的含义？

###### 示例

```sql
select regexp_match('Köln', '[a-zA-Z]ö[a-zA-Z]{2}');
+---------------------------------------------------------+
| regexp_match(Utf8("Köln"),Utf8("[a-zA-Z]ö[a-zA-Z]{2}")) |
+---------------------------------------------------------+
| [Köln]                                                  |
+---------------------------------------------------------+
SELECT regexp_match('aBc', '(b|d)', 'i');
+---------------------------------------------------+
| regexp_match(Utf8("aBc"),Utf8("(b|d)"),Utf8("i")) |
+---------------------------------------------------+
| [B]                                               |
+---------------------------------------------------+
```

更多示例可以在[这里](https://github.com/apache/datafusion/blob/main/datafusion-examples/examples/regexp.rs)找到

##### `regexp_replace`

替换字符串中与[正则表达式](https://docs.rs/regex/latest/regex/#syntax)匹配的子字符串。

```
regexp_replace(str, regexp, replacement[, flags])
```

###### 参数

- **str**：要操作的字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **regexp**：要与之匹配的正则表达式。
  可以是常量、列或函数。
- **replacement**：替换字符串表达式。
  可以是常量、列或函数，以及任意组合的字符串运算符。
- **flags**：可选的正则表达式标志，用于控制正则表达式的行为。支持以下标志：
  - **g**：（全局）全局搜索，匹配后不返回
  - **i**：不区分大小写：字母匹配大写和小写
  - **m**：多行模式：^和$匹配行的开头和结尾
  - **s**：允许.匹配\n
  - **R**：启用CRLF模式：当启用多行模式时，使用\r\n
  - **U**：交换x*和x*的含义？

###### 示例

```sql
SELECT regexp_replace('foobarbaz', 'b(..)', 'X\\1Y', 'g');
+------------------------------------------------------------------------+
| regexp_replace(Utf8("foobarbaz"),Utf8("b(..)"),Utf8("X\1Y"),Utf8("g")) |
+------------------------------------------------------------------------+
| fooXarYXazY                                                            |
+------------------------------------------------------------------------+
SELECT regexp_replace('aBc', '(b|d)', 'Ab\\1a', 'i');
+-------------------------------------------------------------------+
| regexp_replace(Utf8("aBc"),Utf8("(b|d)"),Utf8("Ab\1a"),Utf8("i")) |
+-------------------------------------------------------------------+
| aAbBac                                                            |
+-------------------------------------------------------------------+
```

更多示例可以在[这里](https://github.com/apache/datafusion/blob/main/datafusion-examples/examples/regexp.rs)找到

##### `position`

返回`origstr`中`substr`的位置（从1开始计数）。如果`origstr`中不存在`substr`，则返回0。

```
position(substr in origstr)
```

###### 参数

- **substr**：模式字符串。
- **origstr**：模型字符串。

##### `contains`

如果`search_string`在`string`中找到，则返回true。

```
contains(string, search_string)
```

###### 参数

- **string**：模式字符串。
- **search_string**：模型字符串。

### 时间和日期函数

- [now](#now)
- [current_date](#current-date)
- [current_time](#current-time)
- [date_bin](#date-bin)
- [date_trunc](#date-trunc)
- [datetrunc](#datetrunc)
- [date_part](#date-part)
- [datepart](#datepart)
- [extract](#extract)
- [today](#today)
- [make_date](#make-date)
- [to_char](#to-char)
- [to_date](#to-date)
- [to_timestamp](#to-timestamp)
- [to_timestamp_millis](#to-timestamp-millis)
- [to_timestamp_micros](#to-timestamp-micros)
- [to_timestamp_seconds](#to-timestamp-seconds)
- [to_timestamp_nanos](#to-timestamp-nanos)
- [from_unixtime](#from-unixtime)
- [to_unixtime](#to-unixtime)

##### `now`

返回当前的 UTC 时间戳。

`now()`的返回值在查询时确定，并且无论函数在查询计划的哪个位置执行，都会返回相同的时间戳。

```
now()
```

##### `current_date`

返回当前的 UTC 日期。

`current_date()`的返回值在查询时确定，并且无论函数在查询计划的哪个位置执行，都会返回相同的日期。

```
current_date()
```

###### 别名

- today

##### `today`

[current_date](#current-date)的别名。

##### `current_time`

返回当前的UTC时间。

`current_time()`的返回值在查询时确定，并且无论函数在查询计划的哪个位置执行，都会返回相同的时间。

```
current_time()
```

##### `date_bin`

计算时间间隔，并返回最接近指定时间戳的间隔的起始时间。
使用`date_bin`将时间序列数据按时间“bin”或“window”分组，并对每个窗口应用聚合或选择器函数，以降低采样率。

例如，如果将数据分组为15分钟的间隔，输入时间戳`2023-01-01T18:18:18Z`将更新为所在15分钟间隔的起始时间：`2023-01-01T18:15:00Z`。

```
date_bin(interval, expression, origin-timestamp)
```

###### 参数

- **interval**：时间间隔。
- **expression**：要操作的时间表达式。
  可以是常量、列或函数。
- **origin-timestamp**：可选。用于确定间隔边界的起始点。如果未指定，默认为`1970-01-01T00:00:00Z`（UNIX纪元时间，UTC）。

支持以下时间间隔：

- nanoseconds
- microseconds
- milliseconds
- seconds
- minutes
- hours
- days
- weeks
- months
- years
- century
##### `date_trunc`

将时间戳值截断到指定的精度。

```
date_trunc(精度, 表达式)
```

###### 参数

- **精度**：要截断到的时间精度。
  支持以下精度：

  - year / YEAR
  - quarter / QUARTER
  - month / MONTH
  - week / WEEK
  - day / DAY
  - hour / HOUR
  - minute / MINUTE
  - second / SECOND
  - **expression**: 操作的时间表达式。
    可以是常量、列或函数。

  ###### 别名

  - datetrunc

  ##### `datetrunc`

  [date_trunc](#date-trunc)的别名。

  ##### `date_part`

  返回日期的指定部分作为整数。

  ```
  date_part(part, expression)
  ```

  ###### 参数

  - **part**: 要返回的日期部分。
    支持以下日期部分：

  - year
  - quarter _(emits value in inclusive range [1, 4] based on which quartile of the year the date is in)_
  - month
  - week _(week of the year)_
  - day _(day of the month)_
  - hour
  - minute
  - second
  - millisecond
  - microsecond
  - nanosecond
  - dow _(day of the week)_
  - doy _(day of the year)_
  - epoch _(seconds since Unix epoch)_
  - **expression**：要操作的时间表达式。
    可以是常量、列或函数。

  ###### 别名

  - datepart

  ##### `datepart`

  _别名：[date_part](#date-part)。_

  ##### `extract`

  从时间值中返回一个子字段作为整数。

  ```
  extract(字段 FROM 源)
  ```

  等同于调用`date_part('字段', 源)`。例如，下面两个语句是等价的：

  ```sql
  extract(day FROM '2024-04-13'::date)
  date_part('day', '2024-04-13'::date)
  ```

  请参阅[date_part](#date-part)。
  ##### `make_date`

  从年/月/日组件部分创建日期。

  ```
  make_date(year, month, day)
  ```

  ###### 参数

  - **year**：创建日期时要使用的年份。
    可以是常量、列或函数，以及任意组合的算术运算符。
  - **month**：创建日期时要使用的月份。
    可以是常量、列或函数，以及任意组合的算术运算符。
  - **day**：创建日期时要使用的日期。
    可以是常量、列或函数，以及任意组合的算术运算符。

  ###### 示例

  ```
  > select make_date(2023, 1, 31);
  +-------------------------------------------+
  | make_date(Int64(2023),Int64(1),Int64(31)) |
  +-------------------------------------------+
  | 2023-01-31                                |
  +-------------------------------------------+
  > select make_date('2023', '01', '31');
  +-----------------------------------------------+
  | make_date(Utf8("2023"),Utf8("01"),Utf8("31")) |
  +-----------------------------------------------+
  | 2023-01-31                                    |
  +-----------------------------------------------+
  ```

  更多示例可以在[这里](https://github.com/apache/datafusion/blob/main/datafusion-examples/examples/make_date.rs)找到

  ##### `to_char`

  根据[Chrono格式]，返回日期、时间、时间戳或持续时间的字符串表示。
  与PostgreSQL中的等效函数不同，不支持数字格式化。

  ```
  to_char(expression, format)
  ```

  ###### 参数

  - **expression**：要操作的表达式。
    可以是常量、列或函数，以及任意组合的算术运算符，结果为日期、时间、时间戳或持续时间。
  - **format**：用于转换表达式的[Chrono格式]字符串。

  ###### 示例

  ```
  > > select to_char('2023-03-01'::date, '%d-%m-%Y');
  +----------------------------------------------+
  | to_char(Utf8("2023-03-01"),Utf8("%d-%m-%Y")) |
  +----------------------------------------------+
  | 01-03-2023                                   |
  +----------------------------------------------+
  ```

  更多示例可以在[这里](https://github.com/apache/datafusion/blob/main/datafusion-examples/examples/to_char.rs)找到

  ###### 别名

  - date_format

  ##### `to_date`

  将值转换为日期（`YYYY-MM-DD`）。
  支持字符串、整数和双精度类型作为输入。
  如果未提供[Chrono格式]，则将字符串解析为YYYY-MM-DD（例如'2023-07-20'）。
  整数和双精度类型被解释为自UNIX纪元（`1970-01-01T00:00:00Z`）以来的天数。
  返回相应的日期。

  注意：`to_date`返回Date32。整数输入的支持范围为`-96465293`到`95026237`。
  字符串输入的支持范围为`1677-09-21`到`2262-04-11`（不包括）。要解析超出该范围的日期，请使用[Chrono格式]。

  ```
  to_date(expression[, ..., format_n])
  ```

  ###### 参数

  - **expression**：要操作的表达式。
    可以是常量、列或函数，以及任意组合的算术运算符。
  - **format_n**：可选的[Chrono格式]字符串，用于解析表达式。将按照它们出现的顺序尝试格式，
    第一个成功的格式将被返回。如果没有格式成功解析表达式，则会返回错误。

  [Chrono格式]：https://docs.rs/chrono/latest/chrono/format/strftime/index.html

  ###### 示例

  ```
  > select to_date('2023-01-31');
  +-----------------------------+
  | to_date(Utf8("2023-01-31")) |
  +-----------------------------+
  | 2023-01-31                  |
  +-----------------------------+
  > select to_date('2023/01/31', '%Y-%m-%d', '%Y/%m/%d');
  +---------------------------------------------------------------+
  | to_date(Utf8("2023/01/31"),Utf8("%Y-%m-%d"),Utf8("%Y/%m/%d")) |
  +---------------------------------------------------------------+
  | 2023-01-31                                                    |
  +---------------------------------------------------------------+
  ```

  更多示例可以在[这里](https://github.com/apache/datafusion/blob/main/datafusion-examples/examples/to_date.rs)找到


##### `to_timestamp`

将值转换为时间戳（`YYYY-MM-DDT00:00:00Z`）。
支持字符串、整数、无符号整数和双精度类型作为输入。
如果没有提供[Chrono格式]，则将字符串解析为RFC3339格式（例如'2023-07-20T05:44:00'）。
整数、无符号整数和双精度数被解释为自UNIX纪元（`1970-01-01T00:00:00Z`）以来的秒数。
返回相应的时间戳。

注意：`to_timestamp`返回`Timestamp(Nanosecond)`。整数输入的支持范围为`-9223372037`到`9223372036`。
字符串输入的支持范围为`1677-09-21T00:12:44.0`到`2262-04-11T23:47:16.0`。请在支持范围之外的输入中使用`to_timestamp_seconds`。

```
to_timestamp(expression[, ..., format_n])
```

###### 参数

- **expression**：要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **format_n**：可选的[Chrono格式]字符串，用于解析表达式。将按照它们出现的顺序尝试格式，返回第一个成功的格式。如果没有格式成功解析表达式，则会返回错误。

[chrono格式]：https://docs.rs/chrono/latest/chrono/format/strftime/index.html

###### 示例

```
> select to_timestamp('2023-01-31T09:26:56.123456789-05:00');
+-----------------------------------------------------------+
| to_timestamp(Utf8("2023-01-31T09:26:56.123456789-05:00")) |
+-----------------------------------------------------------+
| 2023-01-31T14:26:56.123456789                             |
+-----------------------------------------------------------+
> select to_timestamp('03:59:00.123456789 05-17-2023', '%c', '%+', '%H:%M:%S%.f %m-%d-%Y');
+--------------------------------------------------------------------------------------------------------+
| to_timestamp(Utf8("03:59:00.123456789 05-17-2023"),Utf8("%c"),Utf8("%+"),Utf8("%H:%M:%S%.f %m-%d-%Y")) |
+--------------------------------------------------------------------------------------------------------+
| 2023-05-17T03:59:00.123456789                                                                          |
+--------------------------------------------------------------------------------------------------------+
```

更多示例可以在[这里](https://github.com/apache/datafusion/blob/main/datafusion-examples/examples/to_timestamp.rs)找到

##### `to_timestamp_millis`

将值转换为时间戳（`YYYY-MM-DDT00:00:00.000Z`）。
支持字符串、整数和无符号整数类型作为输入。
如果没有提供[Chrono格式]，则将字符串解析为RFC3339格式（例如'2023-07-20T05:44:00'）。
整数和无符号整数被解释为自UNIX纪元（`1970-01-01T00:00:00Z`）以来的毫秒数。
返回相应的时间戳。

```
to_timestamp_millis(expression[, ..., format_n])
```

###### 参数

- **expression**：要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **format_n**：可选的[Chrono格式]字符串，用于解析表达式。将按照它们出现的顺序尝试格式，返回第一个成功的格式。如果没有格式成功解析表达式，则会返回错误。

###### 示例

```
> select to_timestamp_millis('2023-01-31T09:26:56.123456789-05:00');
+------------------------------------------------------------------+
| to_timestamp_millis(Utf8("2023-01-31T09:26:56.123456789-05:00")) |
+------------------------------------------------------------------+
| 2023-01-31T14:26:56.123                                          |
+------------------------------------------------------------------+
> select to_timestamp_millis('03:59:00.123456789 05-17-2023', '%c', '%+', '%H:%M:%S%.f %m-%d-%Y');
+---------------------------------------------------------------------------------------------------------------+
| to_timestamp_millis(Utf8("03:59:00.123456789 05-17-2023"),Utf8("%c"),Utf8("%+"),Utf8("%H:%M:%S%.f %m-%d-%Y")) |
+---------------------------------------------------------------------------------------------------------------+
| 2023-05-17T03:59:00.123                                                                                       |
+---------------------------------------------------------------------------------------------------------------+
```

更多示例可以在[这里](https://github.com/apache/datafusion/blob/main/datafusion-examples/examples/to_timestamp.rs)找到

##### `to_timestamp_micros`

将值转换为时间戳（`YYYY-MM-DDT00:00:00.000000Z`）。
支持字符串、整数和无符号整数类型作为输入。
如果没有提供[Chrono格式]，则将字符串解析为RFC3339格式（例如'2023-07-20T05:44:00'）。
整数和无符号整数被解释为自UNIX纪元（`1970-01-01T00:00:00Z`）以来的微秒数。
返回相应的时间戳。

```
to_timestamp_micros(expression[, ..., format_n])
```

###### 参数

- **expression**：要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **format_n**：可选的[Chrono格式]字符串，用于解析表达式。将按照它们出现的顺序尝试格式，返回第一个成功的格式。如果没有格式成功解析表达式，则会返回错误。

###### 示例

```
> select to_timestamp_micros('2023-01-31T09:26:56.123456789-05:00');
+------------------------------------------------------------------+
| to_timestamp_micros(Utf8("2023-01-31T09:26:56.123456789-05:00")) |
+------------------------------------------------------------------+
| 2023-01-31T14:26:56.123456                                       |
+------------------------------------------------------------------+
> select to_timestamp_micros('03:59:00.123456789 05-17-2023', '%c', '%+', '%H:%M:%S%.f %m-%d-%Y');
+---------------------------------------------------------------------------------------------------------------+
| to_timestamp_micros(Utf8("03:59:00.123456789 05-17-2023"),Utf8("%c"),Utf8("%+"),Utf8("%H:%M:%S%.f %m-%d-%Y")) |
+---------------------------------------------------------------------------------------------------------------+
| 2023-05-17T03:59:00.123456                                                                                    |
+---------------------------------------------------------------------------------------------------------------+
```

更多示例可以在[这里](https://github.com/apache/datafusion/blob/main/datafusion-examples/examples/to_timestamp.rs)找到
##### `to_timestamp_nanos`

将值转换为时间戳（`YYYY-MM-DDT00:00:00.000000000Z`）。
支持字符串、整数和无符号整数类型作为输入。
如果没有提供[Chrono格式]，则将字符串解析为RFC3339格式（例如'2023-07-20T05:44:00'）。
整数和无符号整数被解释为自UNIX纪元（`1970-01-01T00:00:00Z`）以来的纳秒数。
返回相应的时间戳。

```
to_timestamp_nanos(expression[, ..., format_n])
```

###### 参数

- **expression**：要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **format_n**：可选的[Chrono格式]字符串，用于解析表达式。将按照它们出现的顺序尝试格式，返回第一个成功的格式。如果没有格式成功解析表达式，则会返回错误。

###### 示例

```
> select to_timestamp_nanos('2023-01-31T09:26:56.123456789-05:00');
+-----------------------------------------------------------------+
| to_timestamp_nanos(Utf8("2023-01-31T09:26:56.123456789-05:00")) |
+-----------------------------------------------------------------+
| 2023-01-31T14:26:56.123456789                                   |
+-----------------------------------------------------------------+
> select to_timestamp_nanos('03:59:00.123456789 05-17-2023', '%c', '%+', '%H:%M:%S%.f %m-%d-%Y');
+--------------------------------------------------------------------------------------------------------------+
| to_timestamp_nanos(Utf8("03:59:00.123456789 05-17-2023"),Utf8("%c"),Utf8("%+"),Utf8("%H:%M:%S%.f %m-%d-%Y")) |
+--------------------------------------------------------------------------------------------------------------+
| 2023-05-17T03:59:00.123456789                                                                                |
+---------------------------------------------------------------------------------------------------------------+
```

更多示例可以在[这里](https://github.com/apache/datafusion/blob/main/datafusion-examples/examples/to_timestamp.rs)找到

##### `to_timestamp_seconds`

将值转换为时间戳（`YYYY-MM-DDT00:00:00.000Z`）。
支持字符串、整数和无符号整数类型作为输入。
如果没有提供[Chrono格式]，则将字符串解析为RFC3339格式（例如'2023-07-20T05:44:00'）。
整数和无符号整数被解释为自UNIX纪元（`1970-01-01T00:00:00Z`）以来的秒数。
返回相应的时间戳。

```
to_timestamp_seconds(expression[, ..., format_n])
```

###### 参数

- **expression**：要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **format_n**：可选的[Chrono格式]字符串，用于解析表达式。将按照它们出现的顺序尝试格式，返回第一个成功的格式。如果没有格式成功解析表达式，则会返回错误。

###### 示例

```
> select to_timestamp_seconds('2023-01-31T09:26:56.123456789-05:00');
+-------------------------------------------------------------------+
| to_timestamp_seconds(Utf8("2023-01-31T09:26:56.123456789-05:00")) |
+-------------------------------------------------------------------+
| 2023-01-31T14:26:56                                               |
+-------------------------------------------------------------------+
> select to_timestamp_seconds('03:59:00.123456789 05-17-2023', '%c', '%+', '%H:%M:%S%.f %m-%d-%Y');
+----------------------------------------------------------------------------------------------------------------+
| to_timestamp_seconds(Utf8("03:59:00.123456789 05-17-2023"),Utf8("%c"),Utf8("%+"),Utf8("%H:%M:%S%.f %m-%d-%Y")) |
+----------------------------------------------------------------------------------------------------------------+
| 2023-05-17T03:59:00                                                                                            |
+----------------------------------------------------------------------------------------------------------------+
```

更多示例可以在[这里](https://github.com/apache/datafusion/blob/main/datafusion-examples/examples/to_timestamp.rs)找到

##### `from_unixtime`

将整数转换为RFC3339时间戳格式（`YYYY-MM-DDT00:00:00.000000000Z`）。
整数和无符号整数被解释为自UNIX纪元（`1970-01-01T00:00:00Z`）以来的纳秒数。
返回相应的时间戳。

```
from_unixtime(expression)
```

###### 参数

- **expression**：要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `to_unixtime`

将值转换为自UNIX纪元（`1970-01-01T00:00:00Z`）以来的秒数。
支持字符串、日期、时间戳和双精度类型作为输入。
如果没有提供[Chrono格式]，则将字符串解析为RFC3339格式（例如'2023-07-20T05:44:00'）。
返回相应的秒数。

```
to_unixtime(expression[, ..., format_n])
```

###### 参数

- **expression**：要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **format_n**：可选的[Chrono格式]字符串，用于解析表达式。将按照它们出现的顺序尝试格式，返回第一个成功的格式。如果没有格式成功解析表达式，则会返回错误。

###### 示例

```
> select to_unixtime('2020-09-08T12:00:00+00:00');
+------------------------------------------------+
| to_unixtime(Utf8("2020-09-08T12:00:00+00:00")) |
+------------------------------------------------+
| 1599566400                                     |
+------------------------------------------------+
> select to_unixtime('01-14-2023 01:01:30+05:30', '%q', '%d-%m-%Y %H/%M/%S', '%+', '%m-%d-%Y %H:%M:%S%#z');
+-----------------------------------------------------------------------------------------------------------------------------+
| to_unixtime(Utf8("01-14-2023 01:01:30+05:30"),Utf8("%q"),Utf8("%d-%m-%Y %H/%M/%S"),Utf8("%+"),Utf8("%m-%d-%Y %H:%M:%S%#z")) |
+-----------------------------------------------------------------------------------------------------------------------------+
| 1673638290                                                                                                                  |
+-----------------------------------------------------------------------------------------------------------------------------+
```

### 数组函数

- [array_append](#array-append)
- [array_sort](#array-sort)
- [array_cat](#array-cat)
- [array_concat](#array-concat)
- [array_contains](#array-contains)
- [array_dims](#array-dims)
- [array_distinct](#array-distinct)
- [array_has](#array-has)
- [array_has_all](#array-has-all)
- [array_has_any](#array-has-any)
- [array_element](#array-element)
- [array_empty](#array-empty)
- [array_except](#array-except)
- [array_extract](#array-extract)
- [array_fill](#array-fill)
- [array_indexof](#array-indexof)
- [array_intersect](#array-intersect)
- [array_join](#array-join)
- [array_length](#array-length)
- [array_ndims](#array-ndims)
- [array_prepend](#array-prepend)
- [array_pop_front](#array-pop-front)
- [array_pop_back](#array-pop-back)
- [array_position](#array-position)
- [array_positions](#array-positions)
- [array_push_back](#array-push-back)
- [array_push_front](#array-push-front)
- [array_repeat](#array-repeat)
- [array_resize](#array-resize)
- [array_remove](#array-remove)
- [array_remove_n](#array-remove-n)
- [array_remove_all](#array-remove-all)
- [array_replace](#array-replace)
- [array_replace_n](#array-replace-n)
- [array_replace_all](#array-replace-all)
- [array_reverse](#array-reverse)
- [array_slice](#array-slice)
- [array_to_string](#array-to-string)
- [array_union](#array-union)
- [cardinality](#cardinality)
- [empty](#empty)
- [flatten](#flatten)
- [generate_series](#generate-series)
- [list_append](#list-append)
- [list_sort](#list-sort)
- [list_cat](#list-cat)
- [list_concat](#list-concat)
- [list_dims](#list-dims)
- [list_distinct](#list-distinct)
- [list_element](#list-element)
- [list_except](#list-except)
- [list_extract](#list-extract)
- [list_has](#list-has)
- [list_has_all](#list-has-all)
- [list_has_any](#list-has-any)
- [list_indexof](#list-indexof)
- [list_intersect](#list-intersect)
- [list_join](#list-join)
- [list_length](#list-length)
- [list_ndims](#list-ndims)
- [list_prepend](#list-prepend)
- [list_pop_back](#list-pop-back)
- [list_pop_front](#list-pop-front)
- [list_position](#list-position)
- [list_positions](#list-positions)
- [list_push_back](#list-push-back)
- [list_push_front](#list-push-front)
- [list_repeat](#list-repeat)
- [list_resize](#list-resize)
- [list_remove](#list-remove)
- [list_remove_n](#list-remove-n)
- [list_remove_all](#list-remove-all)
- [list_replace](#list-replace)
- [list_replace_n](#list-replace-n)
- [list_replace_all](#list-replace-all)
- [list_slice](#list-slice)
- [list_to_string](#list-to-string)
- [list_union](#list-union)
- [make_array](#make-array)
- [make_list](#make-list)
- [string_to_array](#string-to-array)
- [string_to_list](#string-to-list)
- [trim_array](#trim-array)
- [unnest](#unnest)
- [range](#range)

##### `array_append`

将元素追加到数组的末尾。

```
array_append(array, element)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **element**：要追加到数组的元素。

###### 示例

```
> select array_append([1, 2, 3], 4);
+--------------------------------------+
| array_append(List([1,2,3]),Int64(4)) |
+--------------------------------------+
| [1, 2, 3, 4]                         |
+--------------------------------------+
```

###### 别名

- array_push_back
- list_append
- list_push_back

##### `array_sort`

对数组进行排序。

```
array_sort(array, desc, nulls_first)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **desc**：是否按降序排序（`ASC` 或 `DESC`）。
- **nulls_first**：是否将空值排在前面（`NULLS FIRST` 或 `NULLS LAST`）。

###### 示例

```
> select array_sort([3, 1, 2]);
+-----------------------------+
| array_sort(List([3,1,2]))   |
+-----------------------------+
| [1, 2, 3]                   |
+-----------------------------+
```

###### 别名

- list_sort

##### `array_resize`

调整数组的大小，使其包含指定数量的元素。如果未设置值，则初始化新元素为空。

```
array_resize(array, size, value)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **size**：数组的新大小。
- **value**：定义新元素的值，如果未设置值，则为空。

###### 示例

```
> select array_resize([1, 2, 3], 5, 0);
+-------------------------------------+
| array_resize(List([1,2,3],5,0))     |
+-------------------------------------+
| [1, 2, 3, 0, 0]                     |
+-------------------------------------+
```

###### 别名

- list_resize

##### `array_cat`

_别名：[array_concat](#array-concat)。_

##### `array_concat`

连接数组。

```
array_concat(array[, ..., array_n])
```

###### 参数

- **array**：要连接的数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **array_n**：要连接的后续数组列或字面数组。

###### 示例

```
> select array_concat([1, 2], [3, 4], [5, 6]);
+---------------------------------------------------+
| array_concat(List([1,2]),List([3,4]),List([5,6])) |
+---------------------------------------------------+
| [1, 2, 3, 4, 5, 6]                                |
+---------------------------------------------------+
```

###### 别名

- array_cat
- list_cat
- list_concat

##### `array_contains`

_别名：[array_has](#array-has)。_

##### `array_has`

如果数组包含元素，则返回true。

```
array_has(array, element)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **element**：标量或数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。

###### 别名

- list_has

##### `array_has_all`

如果子数组的所有元素都存在于数组中，则返回true。

```
array_has_all(array, sub-array)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **sub-array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。

###### 别名

- list_has_all

##### `array_has_any`

如果两个数组中存在任何元素，则返回true。

```
array_has_any(array, sub-array)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **sub-array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。

###### 别名

- list_has_any

##### `array_dims`

返回数组的维度数组。

```
array_dims(array)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。

###### 示例

```
> select array_dims([[1, 2, 3], [4, 5, 6]]);
+---------------------------------+
| array_dims(List([1,2,3,4,5,6])) |
+---------------------------------+
| [2, 3]                          |
+---------------------------------+
```

###### 别名

- list_dims

##### `array_distinct`

从数组中移除重复项后返回不重复的值数组。

```
array_distinct(array)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。

###### 示例

```
> select array_distinct([1, 3, 2, 3, 1, 2, 4]);
+---------------------------------+
| array_distinct(List([1,2,3,4])) |
+---------------------------------+
| [1, 2, 3, 4]                    |
+---------------------------------+
```

###### 别名

- list_distinct

##### `array_element`

从数组中提取索引为n的元素。

```
array_element(array, index)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **index**：要从数组中提取元素的索引。

###### 示例

```
> select array_element([1, 2, 3, 4], 3);
+-----------------------------------------+
| array_element(List([1,2,3,4]),Int64(3)) |
+-----------------------------------------+
| 3                                       |
+-----------------------------------------+
```

###### 别名

- array_extract
- list_element
- list_extract

##### `array_extract`

_别名：[array_element](#array-element)。_

##### `array_fill`

返回由给定值填充的数组。

已弃用：请改用 `array_repeat`！

```
array_fill(element, array)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **element**：要复制到数组的元素。

##### `flatten`

将数组的数组转换为扁平数组

- 适用于任意嵌套数组的深度
- 不会改变已经是扁平的数组

扁平化的数组包含所有源数组的元素。

###### 参数

- **array**：数组表达式
  可以是常量、列或函数，以及任何组合的数组操作符。

```
flatten(array)
```

##### `array_indexof`

_别名：[array_position](#array-position)。_

##### `array_intersect`

返回数组1和数组2的交集元素数组。

```
array_intersect(array1, array2)
```

###### 参数

- **array1**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **array2**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。

###### 示例

```
> select array_intersect([1, 2, 3, 4], [5, 6, 3, 4]);
+----------------------------------------------------+
| array_intersect([1, 2, 3, 4], [5, 6, 3, 4]);       |
+----------------------------------------------------+
| [3, 4]                                             |
+----------------------------------------------------+
> select array_intersect([1, 2, 3, 4], [5, 6, 7, 8]);
+----------------------------------------------------+
| array_intersect([1, 2, 3, 4], [5, 6, 7, 8]);       |
+----------------------------------------------------+
| []                                                 |
+----------------------------------------------------+
```

---
###### 别名

- list_intersect

##### `array_join`

_别名：[array_to_string](#array-to-string)。_

##### `array_length`

返回数组的长度。

```
array_length(array, dimension)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **dimension**：数组的维度。

###### 示例

```
> select array_length([1, 2, 3, 4, 5]);
+---------------------------------+
| array_length(List([1,2,3,4,5])) |
+---------------------------------+
| 5                               |
+---------------------------------+
```

###### 别名

- list_length

##### `array_ndims`

返回数组的维度数。

```
array_ndims(array, element)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。

###### 示例

```
> select array_ndims([[1, 2, 3], [4, 5, 6]]);
+----------------------------------+
| array_ndims(List([1,2,3,4,5,6])) |
+----------------------------------+
| 2                                |
+----------------------------------+
```

###### 别名

- list_ndims

##### `array_prepend`

在数组的开头添加一个元素。

```
array_prepend(element, array)
```

###### 参数

- **element**：要添加到数组开头的元素。
- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。

###### 示例

```
> select array_prepend(1, [2, 3, 4]);
+---------------------------------------+
| array_prepend(Int64(1),List([2,3,4])) |
+---------------------------------------+
| [1, 2, 3, 4]                          |
+---------------------------------------+
```

###### 别名

- array_push_front
- list_prepend
- list_push_front

##### `array_pop_front`

返回删除第一个元素后的数组。

```
array_pop_front(array)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。

###### 示例

```
> select array_pop_front([1, 2, 3]);
+-------------------------------+
| array_pop_front(List([1,2,3])) |
+-------------------------------+
| [2, 3]                        |
+-------------------------------+
```

###### 别名

- list_pop_front

##### `array_pop_back`

返回删除最后一个元素后的数组。

```
array_pop_back(array)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。

###### 示例

```
> select array_pop_back([1, 2, 3]);
+-------------------------------+
| array_pop_back(List([1,2,3])) |
+-------------------------------+
| [1, 2]                        |
+-------------------------------+
```

###### 别名

- list_pop_back

##### `array_position`

返回数组中指定元素的第一次出现的位置。

```
array_position(array, element)
array_position(array, element, index)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **element**：要在数组中搜索位置的元素。
- **index**：开始搜索的索引位置。

###### 示例

```
> select array_position([1, 2, 2, 3, 1, 4], 2);
+----------------------------------------------+
| array_position(List([1,2,2,3,1,4]),Int64(2)) |
+----------------------------------------------+
| 2                                            |
+----------------------------------------------+
```

###### 别名

- array_indexof
- list_indexof
- list_position

##### `array_positions`

在数组中搜索元素，返回所有出现的位置。

```
array_positions(array, element)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **element**：要在数组中搜索位置的元素。

###### 示例

```
> select array_positions([1, 2, 2, 3, 1, 4], 2);
+-----------------------------------------------+
| array_positions(List([1,2,2,3,1,4]),Int64(2)) |
+-----------------------------------------------+
| [2, 3]                                        |
+-----------------------------------------------+
```

###### 别名

- list_positions

##### `array_push_back`

_别名：[array_append](#array-append)。_

##### `array_push_front`

_别名：[array_prepend](#array-prepend)。_

##### `array_repeat`

返回包含元素重复 `count` 次的数组。

```
array_repeat(element, count)
```

###### 参数

- **element**：元素表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **count**：重复元素的次数。

###### 示例

```
> select array_repeat(1, 3);
+---------------------------------+
| array_repeat(Int64(1),Int64(3)) |
+---------------------------------+
| [1, 1, 1]                       |
+---------------------------------+
```

```
> select array_repeat([1, 2], 2);
+------------------------------------+
| array_repeat(List([1,2]),Int64(2)) |
+------------------------------------+
| [[1, 2], [1, 2]]                   |
+------------------------------------+
```

###### 别名

- list_repeat

##### `array_remove`

从数组中删除第一个等于给定值的元素。

```
array_remove(array, element)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **element**：要从数组中删除的元素。

###### 示例

```
> select array_remove([1, 2, 2, 3, 2, 1, 4], 2);
+----------------------------------------------+
| array_remove(List([1,2,2,3,2,1,4]),Int64(2)) |
+----------------------------------------------+
| [1, 2, 3, 2, 1, 4]                           |
+----------------------------------------------+
```

###### 别名

- list_remove

##### `array_remove_n`

从数组中删除前 `max` 个等于给定值的元素。

```
array_remove_n(array, element, max)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **element**：要从数组中删除的元素。
- **max**：要删除的首次出现的次数。

###### 示例

```
> select array_remove_n([1, 2, 2, 3, 2, 1, 4], 2, 2);
+---------------------------------------------------------+
| array_remove_n(List([1,2,2,3,2,1,4]),Int64(2),Int64(2)) |
+---------------------------------------------------------+
| [1, 3, 2, 1, 4]                                         |
+---------------------------------------------------------+
```

###### 别名

- list_remove_n

##### `array_remove_all`

从数组中删除所有等于给定值的元素。

```
array_remove_all(array, element)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **element**：要从数组中删除的元素。

###### 示例

```
> select array_remove_all([1, 2, 2, 3, 2, 1, 4], 2);
+--------------------------------------------------+
| array_remove_all(List([1,2,2,3,2,1,4]),Int64(2)) |
+--------------------------------------------------+
| [1, 3, 1, 4]                                     |
+--------------------------------------------------+
```

###### 别名

- list_remove_all

##### `array_replace`

将指定元素的第一个出现替换为另一个指定元素。

```
array_replace(array, from, to)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **from**：初始元素。
- **to**：最终元素。

###### 示例

```
> select array_replace([1, 2, 2, 3, 2, 1, 4], 2, 5);
+--------------------------------------------------------+
| array_replace(List([1,2,2,3,2,1,4]),Int64(2),Int64(5)) |
+--------------------------------------------------------+
| [1, 5, 2, 3, 2, 1, 4]                                  |
+--------------------------------------------------------+
```

###### 别名

- list_replace

##### `array_replace_n`

将指定元素的前 `max` 个出现替换为另一个指定元素。

```
array_replace_n(array, from, to, max)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **from**：初始元素。
- **to**：最终元素。
- **max**：要替换的首次出现的次数。

###### 示例

```
> select array_replace_n([1, 2, 2, 3, 2, 1, 4], 2, 5, 2);
+-------------------------------------------------------------------+
| array_replace_n(List([1,2,2,3,2,1,4]),Int64(2),Int64(5),Int64(2)) |
+-------------------------------------------------------------------+
| [1, 5, 5, 3, 2, 1, 4]                                             |
+-------------------------------------------------------------------+
```

###### 别名

- list_replace_n

##### `array_replace_all`

将所有指定元素替换为另一个指定元素。

```
array_replace_all(array, from, to)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **from**：初始元素。
- **to**：最终元素。

###### 示例

```
> select array_replace_all([1, 2, 2, 3, 2, 1, 4], 2, 5);
+------------------------------------------------------------+
| array_replace_all(List([1,2,2,3,2,1,4]),Int64(2),Int64(5)) |
+------------------------------------------------------------+
| [1, 5, 5, 3, 5, 1, 4]                                      |
+------------------------------------------------------------+
```

###### 别名

- list_replace_all

##### `array_reverse`

返回元素顺序颠倒的数组。

```
array_reverse(array)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。

###### 示例

```
> select array_reverse([1, 2, 3, 4]);
+------------------------------------------------------------+
| array_reverse(List([1, 2, 3, 4]))                          |
+------------------------------------------------------------+
| [4, 3, 2, 1]                                               |
+------------------------------------------------------------+
```

###### 别名

- list_reverse

##### `array_slice`

根据从 1 开始的起始和结束位置返回数组的切片。

```
array_slice(array, begin, end)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **begin**：第一个元素的索引。
  如果为负数，则从数组末尾开始计数。
- **end**：最后一个元素的索引。
  如果为负数，则从数组末尾开始计数。
- **stride**：数组切片的步长。默认为 1。

###### 示例

```
> select array_slice([1, 2, 3, 4, 5, 6, 7, 8], 3, 6);
+--------------------------------------------------------+
| array_slice(List([1,2,3,4,5,6,7,8]),Int64(3),Int64(6)) |
+--------------------------------------------------------+
| [3, 4, 5, 6]                                           |
+--------------------------------------------------------+
```

###### 别名

- list_slice

##### `array_to_string`

将每个元素转换为其文本表示形式。

```
array_to_string(array, delimiter)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **delimiter**：数组元素的分隔符。

###### 示例

```
> select array_to_string([[1, 2, 3, 4], [5, 6, 7, 8]], ',');
+----------------------------------------------------+
| array_to_string(List([1,2,3,4,5,6,7,8]),Utf8(",")) |
+----------------------------------------------------+
| 1,2,3,4,5,6,7,8                                    |
+----------------------------------------------------+
```

###### 别名

- array_join
- list_join
- list_to_string

##### `array_union`

返回两个数组中都存在的元素的数组（两个数组的所有元素），并去除重复项。

```
array_union(array1, array2)
```

###### 参数

- **array1**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **array2**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。

###### 示例

```
> select array_union([1, 2, 3, 4], [5, 6, 3, 4]);
+----------------------------------------------------+
| array_union([1, 2, 3, 4], [5, 6, 3, 4]);           |
+----------------------------------------------------+
| [1, 2, 3, 4, 5, 6]                                 |
+----------------------------------------------------+
> select array_union([1, 2, 3, 4], [5, 6, 7, 8]);
+----------------------------------------------------+
| array_union([1, 2, 3, 4], [5, 6, 7, 8]);           |
+----------------------------------------------------+
| [1, 2, 3, 4, 5, 6, 7, 8]                           |
+----------------------------------------------------+
```

---

###### 别名

- list_union

##### `array_except`

返回出现在第一个数组中但不在第二个数组中的元素的数组。

```
array_except(array1, array2)
```

###### 参数

- **array1**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。
- **array2**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。

###### 示例

```
> select array_except([1, 2, 3, 4], [5, 6, 3, 4]);
+----------------------------------------------------+
| array_except([1, 2, 3, 4], [5, 6, 3, 4]);           |
+----------------------------------------------------+
| [1, 2]                                 |
+----------------------------------------------------+
> select array_except([1, 2, 3, 4], [3, 4, 5, 6]);
+----------------------------------------------------+
| array_except([1, 2, 3, 4], [3, 4, 5, 6]);           |
+----------------------------------------------------+
| [1, 2]                                 |
+----------------------------------------------------+
```

---

###### 别名

- list_except

##### `cardinality`

返回数组中的元素总数。

```
cardinality(array)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。

###### 示例

```
> select cardinality([[1, 2, 3, 4], [5, 6, 7, 8]]);
+--------------------------------------+
| cardinality(List([1,2,3,4,5,6,7,8])) |
+--------------------------------------+
| 8                                    |
+--------------------------------------+
```

##### `empty`

对于空数组返回 1，对于非空数组返回 0。

```
empty(array)
```

###### 参数

- **array**：数组表达式。
  可以是常量、列或函数，以及任何组合的数组操作符。

###### 示例

```
> select empty([1]);
+------------------+
| empty(List([1])) |
+------------------+
| 0                |
+------------------+
```

###### 别名

- array_empty,
- list_empty


##### `generate_series`

类似于range函数，但包括上限。

```
generate_series(start, stop, step)
```

###### 参数

- **start**: 范围的起始值
- **end**: 范围的结束值（包含）
- **step**: 增加的步长（不能为0）

###### 示例

```
> select generate_series(1,3);
+------------------------------------+
| generate_series(Int64(1),Int64(3)) |
+------------------------------------+
| [1, 2, 3]                          |
+------------------------------------+
```

##### `list_append`

[array_append](#array-append)的别名。

##### `list_cat`

[array_concat](#array-concat)的别名。

##### `list_concat`

[array_concat](#array-concat)的别名。

##### `list_dims`

[array_dims](#array-dims)的别名。

##### `list_distinct`

[array_dims](#array-distinct)的别名。

##### `list_element`

[array_element](#array-element)的别名。

##### `list_empty`

[empty](#empty)的别名。

##### `list_except`

[array_element](#array-except)的别名。

##### `list_extract`

[array_element](#array-element)的别名。

##### `list_has`

[array_has](#array-has)的别名。

##### `list_has_all`

[array_has_all](#array-has-all)的别名。

##### `list_has_any`

[array_has_any](#array-has-any)的别名。

##### `list_indexof`

[array_position](#array-position)的别名。

##### `list_intersect`

[array_position](#array-intersect)的别名。

##### `list_join`

[array_to_string](#array-to-string)的别名。

##### `list_length`

[array_length](#array-length)的别名。

##### `list_ndims`

[array_ndims](#array-ndims)的别名。

##### `list_prepend`

[array_prepend](#array-prepend)的别名。

##### `list_pop_back`

[array_pop_back](#array-pop-back)的别名。

##### `list_pop_front`

[array_pop_front](#array-pop-front)的别名。

##### `list_position`

[array_position](#array-position)的别名。

##### `list_positions`

[array_positions](#array-positions)的别名。

##### `list_push_back`

[array_append](#array-append)的别名。

##### `list_push_front`

[array_prepend](#array-prepend)的别名。

##### `list_repeat`

[array_repeat](#array-repeat)的别名。

##### `list_resize`

[array_resize](#array-resize)的别名。

##### `list_remove`

[array_remove](#array-remove)的别名。

##### `list_remove_n`

[array_remove_n](#array-remove-n)的别名。

##### `list_remove_all`

[array_remove_all](#array-remove-all)的别名。

##### `list_replace`

[array_replace](#array-replace)的别名。

##### `list_replace_n`

[array_replace_n](#array-replace-n)的别名。

##### `list_replace_all`

[array_replace_all](#array-replace-all)的别名。

##### `list_reverse`

[array_reverse](#array-reverse)的别名。

##### `list_slice`

[array_slice](#array-slice)的别名。

##### `list_sort`

[array_sort](#array-sort)的别名。

##### `list_to_string`

[array_to_string](#array-to-string)的别名。

##### `list_union`

[array_union](#array-union)的别名。

##### `make_array`

使用指定的输入表达式返回一个Arrow数组。

```
make_array(expression1[, ..., expression_n])
```

##### `array_empty`

[empty](#empty)的别名。

###### 参数

- **expression_n**: 要包含在输出数组中的表达式。
  可以是常量、列或函数，以及任何组合的算术或字符串运算符。

###### 示例

```
> select make_array(1, 2, 3, 4, 5);
+----------------------------------------------------------+
| make_array(Int64(1),Int64(2),Int64(3),Int64(4),Int64(5)) |
+----------------------------------------------------------+
| [1, 2, 3, 4, 5]                                          |
+----------------------------------------------------------+
```

###### 别名

- make_list

##### `make_list`

[make_array](#make-array)的别名。

##### `string_to_array`

根据分隔符将字符串拆分为子字符串数组。任何与可选的`null_str`参数匹配的子字符串都将替换为NULL。
`SELECT string_to_array('abc##def', '##')` 或 `SELECT string_to_array('abc def', ' ', 'def')`

```
starts_with(str, delimiter[, null_str])
```

###### 参数

- **str**: 要拆分的字符串表达式。
- **delimiter**: 要拆分的分隔符字符串。
- **null_str**: 要替换为`NULL`的子字符串值。

###### 别名

- string_to_list

##### `string_to_list`

[string_to_array](#string-to-array)的别名。

##### `trim_array`

从数组中删除最后n个元素。

已弃用：请改用`array_slice`！

```
trim_array(array, n)
```

###### 参数

- **array**: 数组表达式。
  可以是常量、列或函数，以及任何组合的数组运算符。
- **n**: 要删除的元素个数。

##### `unnest`

将数组转换为行。

###### 参数

- **array**: 要展开的数组表达式。
  可以是常量、列或函数，以及任何组合的数组运算符。

###### 示例

```
> select unnest(make_array(1, 2, 3, 4, 5));
+------------------------------------------------------------------+
| unnest(make_array(Int64(1),Int64(2),Int64(3),Int64(4),Int64(5))) |
+------------------------------------------------------------------+
| 1                                                                |
| 2                                                                |
| 3                                                                |
| 4                                                                |
| 5                                                                |
+------------------------------------------------------------------+
```

```
> select unnest(range(0, 10));
+-----------------------------------+
| unnest(range(Int64(0),Int64(10))) |
+-----------------------------------+
| 0                                 |
| 1                                 |
| 2                                 |
| 3                                 |
| 4                                 |
| 5                                 |
| 6                                 |
| 7                                 |
| 8                                 |
| 9                                 |
+-----------------------------------+
```

##### `range`

返回一个介于起始值和结束值之间的Arrow数组。`SELECT range(2, 10, 3) -> [2, 5, 8]` 或 `SELECT range(DATE '1992-09-01', DATE '1993-03-01', INTERVAL '1' MONTH);`

范围start..end包含所有满足start <= x < end的值。如果start >= end，则为空。

步长不能为0（否则范围将无意义）。

请注意，当所需范围是数字时，它接受(stop)，(start, stop)和(start, stop, step)作为参数，但当所需范围是日期时，它必须是3个非NULL参数。
例如，

```
SELECT range(3);
SELECT range(1,5);
SELECT range(1,5,1);
```

在数字范围中是允许的

但在日期范围中，只有

```
SELECT range(DATE '1992-09-01', DATE '1993-03-01', INTERVAL '1' MONTH);
```

是允许的，而

```
SELECT range(DATE '1992-09-01', DATE '1993-03-01', NULL);
SELECT range(NULL, DATE '1993-03-01', INTERVAL '1' MONTH);
SELECT range(DATE '1992-09-01', NULL, INTERVAL '1' MONTH);
```

是不允许的

###### 参数

- **start**: 范围的起始值
- **end**: 范围的结束值（不包含）
- **step**: 增加的步长（不能为0）

###### 别名

- generate_series

### 结构体函数

- [struct](#struct)
- [named_struct](#named-struct)
- [unnest](#unnest-struct)

##### `struct`

使用指定的输入表达式返回一个Arrow结构体，可选择命名字段。
返回的结构体中的字段使用可选的名称或`cN`命名约定。
例如：`c0`、`c1`、`c2`等。

```
struct(expression1[, ..., expression_n])
```

例如，此查询将两列`a`和`b`转换为具有字段`field_a`和`c1`的结构体类型的单列：

```
select * from t;
+---+---+
| a | b |
+---+---+
| 1 | 2 |
| 3 | 4 |
+---+---+

-- 使用默认名称`c0`、`c1`
> select struct(a, b) from t;
+-----------------+
| struct(t.a,t.b) |
+-----------------+
| {c0: 1, c1: 2}  |
| {c0: 3, c1: 4}  |
+-----------------+

-- 将第一个字段命名为`field_a`
select struct(a as field_a, b) from t;
+--------------------------------------------------+
| named_struct(Utf8("field_a"),t.a,Utf8("c1"),t.b) |
+--------------------------------------------------+
| {field_a: 1, c1: 2}                              |
| {field_a: 3, c1: 4}                              |
+--------------------------------------------------+
```

###### 参数

- **expression_n**: 要包含在输出结构体中的表达式。
  可以是常量、列或函数，以及任何组合的算术或字符串运算符，或前面列出的命名表达式。

##### `named_struct`

使用指定的名称和输入表达式对返回一个Arrow结构体。

```
named_struct(expression1_name, expression1_input[, ..., expression_n_name, expression_n_input])
```

例如，此查询将两列`a`和`b`转换为具有字段`field_a`和`field_b`的结构体类型的单列：

```
select * from t;
+---+---+
| a | b |
+---+---+
| 1 | 2 |
| 3 | 4 |
+---+---+

select named_struct('field_a', a, 'field_b', b) from t;
+-------------------------------------------------------+
| named_struct(Utf8("field_a"),t.a,Utf8("field_b"),t.b) |
+-------------------------------------------------------+
| {field_a: 1, field_b: 2}                              |
| {field_a: 3, field_b: 4}                              |
+-------------------------------------------------------+
```

###### 参数

- **expression_n_name**: 列字段的名称。
  必须是一个常量字符串。
- **expression_n_input**: 要包含在输出结构体中的表达式。
  可以是常量、列或函数，以及任何组合的算术或字符串运算符。

##### `unnest (struct)`

将结构体字段展开为列。

###### 参数

- **struct**: 要展开的对象表达式。
  可以是常量、列或函数，以及任何组合的对象运算符。

###### 示例

```
> select * from foo;
+---------------------+
| column1             |
+---------------------+
| {a: 5, b: a string} |
+---------------------+

> select unnest(column1) from foo;
+-----------------------+-----------------------+
| unnest(foo.column1).a | unnest(foo.column1).b |
+-----------------------+-----------------------+
| 5                     | a string              |
+-----------------------+-----------------------+
```

### 哈希函数

- [digest](#digest)
- [md5](#md5)
- [sha224](#sha224)
- [sha256](#sha256)
- [sha384](#sha384)
- [sha512](#sha512)

##### `digest`

使用指定的算法计算表达式的二进制哈希值。

```
digest(expression, algorithm)
```

###### 参数

- **expression**: 要操作的字符串表达式。
  可以是常量、列或函数，以及任何组合的字符串运算符。
- **algorithm**: 指定要使用的算法的字符串表达式。
  必须是以下之一：

  - md5
  - sha224
  - sha256
  - sha384
  - sha512
  - blake2s
  - blake2b
  - blake3

##### `md5`

计算字符串表达式的MD5 128位校验和。

```
md5(expression)
```

###### 参数

- **expression**: 要操作的字符串表达式。
  可以是常量、列或函数，以及任何组合的字符串运算符。

##### `sha224`

计算二进制字符串的SHA-224哈希值。

```
sha224(expression)
```

###### 参数

- **expression**: 要操作的字符串表达式。
  可以是常量、列或函数，以及任何组合的字符串运算符。

##### `sha256`

计算二进制字符串的SHA-256哈希值。

```
sha256(expression)
```

###### 参数

- **expression**: 要操作的字符串表达式。
  可以是常量、列或函数，以及任何组合的字符串运算符。

##### `sha384`

计算二进制字符串的SHA-384哈希值。

```
sha384(expression)
```

###### 参数

- **expression**: 要操作的字符串表达式。
  可以是常量、列或函数，以及任何组合的字符串运算符。

##### `sha512`

计算二进制字符串的SHA-512哈希值。

```
sha512(expression)
```

###### 参数

- **expression**: 要操作的字符串表达式。
  可以是常量、列或函数，以及任何组合的字符串运算符。

##### `sha512`

计算二进制字符串的SHA-512哈希值。

```
sha512(expression)
```

###### 参数

- **expression**: 要操作的字符串表达式。
  可以是常量、列或函数，以及任何组合的字符串运算符。

### 其他函数

- [arrow_cast](#arrow-cast)
- [arrow_typeof](#arrow-typeof)

##### `arrow_cast`

将值转换为特定的Arrow数据类型：

```
arrow_cast(expression, datatype)
```

###### 参数

- **expression**: 要转换的表达式。
  可以是常量、列或函数，以及任何组合的算术或字符串运算符。
- **datatype**: 要转换为的[Arrow数据类型](https://docs.rs/arrow/latest/arrow/datatypes/enum.DataType.html)名称，作为字符串。
  格式与[`arrow_typeof`]返回的格式相同。

###### 示例

```
> select arrow_cast(-5, 'Int8') as a,
  arrow_cast('foo', 'Dictionary(Int32, Utf8)') as b,
  arrow_cast('bar', 'LargeUtf8') as c,
  arrow_cast('2023-01-02T12:53:02', 'Timestamp(Microsecond, Some("+08:00"))') as d
  ;
+----+-----+-----+---------------------------+
| a  | b   | c   | d                         |
+----+-----+-----+---------------------------+
| -5 | foo | bar | 2023-01-02T12:53:02+08:00 |
+----+-----+-----+---------------------------+
1 row in set. Query took 0.001 seconds.
```

##### `arrow_typeof`

返回表达式的底层[Arrow数据类型](https://docs.rs/arrow/latest/arrow/datatypes/enum.DataType.html)的名称：

```
arrow_typeof(expression)
```

###### 参数

- **expression**: 要评估的表达式。
  可以是常量、列或函数，以及任何组合的算术或字符串运算符。

###### 示例

```
> select arrow_typeof('foo'), arrow_typeof(1);
+---------------------------+------------------------+
| arrow_typeof(Utf8("foo")) | arrow_typeof(Int64(1)) |
+---------------------------+------------------------+
| Utf8                      | Int64                  |
+---------------------------+------------------------+
1 row in set. Query took 0.001 seconds.
```
<!---
  Licensed to the Apache Software Foundation (ASF) under one
  or more contributor license agreements.  See the NOTICE file
  distributed with this work for additional information
  regarding copyright ownership.  The ASF licenses this file
  to you under the Apache License, Version 2.0 (the
  "License"); you may not use this file except in compliance
  with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing,
  software distributed under the License is distributed on an
  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, either express or implied.  See the License for the
  specific language governing permissions and limitations
  under the License.
-->

## 聚合函数

聚合函数对一组值进行计算，得出单个结果。

### 通用

- [avg](#avg)
- [bit_and](#bit-and)
- [bit_or](#bit-or)
- [bit_xor](#bit-xor)
- [bool_and](#bool-and)
- [bool_or](#bool-or)
- [count](#count)
- [max](#max)
- [mean](#mean)
- [median](#median)
- [min](#min)
- [sum](#sum)
- [array_agg](#array-agg)
- [first_value](#first-value)
- [last_value](#last-value)

##### `avg`

返回指定列中数值的平均值。

```
avg(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

###### 别名

- `mean`

##### `bit_and`

计算所有非空输入值的按位与。

```
bit_and(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `bit_or`

计算所有非空输入值的按位或。

```
bit_or(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `bit_xor`

计算所有非空输入值的按位异或。

```
bit_xor(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `bool_and`

如果所有非空输入值都为true，则返回true；否则返回false。

```
bool_and(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `bool_or`

如果任何非空输入值为true，则返回true；否则返回false。

```
bool_or(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `count`

返回指定列中的非空值数量。

要包括_null_值在总计中，请使用`count(*)`。

```
count(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `max`

返回指定列中的最大值。

```
max(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `mean`

[avg](#avg)的别名。

##### `median`

返回指定列中的中位数。

```
median(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `min`

返回指定列中的最小值。

```
min(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `sum`

返回指定列中所有值的总和。

```
sum(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `array_agg`

从表达式元素创建一个数组。如果给定了排序要求，则按照所需的排序顺序插入元素。

```
array_agg(expression [ORDER BY expression])
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `first_value`

根据请求的排序顺序返回聚合组中的第一个元素。如果没有给定排序，则从组中返回任意元素。

```
first_value(expression [ORDER BY expression])
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `last_value`

根据请求的排序顺序返回聚合组中的最后一个元素。如果没有给定排序，则从组中返回任意元素。

```
last_value(expression [ORDER BY expression])
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

### 统计函数

- [corr](#corr)
- [covar](#covar)
- [covar_pop](#covar-pop)
- [covar_samp](#covar-samp)
- [stddev](#stddev)
- [stddev_pop](#stddev-pop)
- [stddev_samp](#stddev-samp)
- [var](#var)
- [var_pop](#var-pop)
- [var_samp](#var-samp)
- [regr_avgx](#regr-avgx)
- [regr_avgy](#regr-avgy)
- [regr_count](#regr-count)
- [regr_intercept](#regr-intercept)
- [regr_r2](#regr-r2)
- [regr_slope](#regr-slope)
- [regr_sxx](#regr-sxx)
- [regr_syy](#regr-syy)
- [regr_sxy](#regr-sxy)

##### `corr`

返回两个数值之间的相关系数。

```
corr(expression1, expression2)
```

###### 参数

- **expression1**: 第一个要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **expression2**: 第二个要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `covar`

返回一组数对的协方差。

```
covar(expression1, expression2)
```

###### 参数

- **expression1**: 第一个要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **expression2**: 第二个要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `covar_pop`

返回一组数对的总体协方差。

```
covar_pop(expression1, expression2)
```

###### 参数

- **expression1**: 第一个要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **expression2**: 第二个要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `covar_samp`

返回一组数对的样本协方差。

```
covar_samp(expression1, expression2)
```

###### 参数

- **expression1**: 第一个要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **expression2**: 第二个要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `stddev`

返回一组数字的标准差。

```
stddev(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `stddev_pop`

返回一组数字的总体标准差。

```
stddev_pop(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `stddev_samp`

返回一组数字的样本标准差。

```
stddev_samp(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `var`

返回一组数字的统计方差。

```
var(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `var_pop`

返回一组数字的总体方差。

```
var_pop(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `var_samp`

返回一组数字的样本方差。

```
var_samp(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `regr_slope`

返回聚合列中非空数对的线性回归线的斜率。
给定输入列 Y 和 X：regr_slope(Y, X) 使用最小的残差平方和拟合返回斜率 (Y = k*X + b)。

```
regr_slope(expression1, expression2)
```

###### 参数

- **expression_y**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **expression_x**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `regr_avgx`

计算非空配对数据点的自变量 (输入) `expression_x` 的平均值。

```
regr_avgx(expression_y, expression_x)
```

###### 参数

- **expression_y**: 因变量。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **expression_x**: 自变量。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `regr_avgy`

计算非空配对数据点的因变量 (输出) `expression_y` 的平均值。

```
regr_avgy(expression_y, expression_x)
```

###### 参数

- **expression_y**: 因变量。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **expression_x**: 自变量。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `regr_count`

计算非空配对数据点的数量。

```
regr_count(expression_y, expression_x)
```

###### 参数

- **expression_y**: 因变量。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **expression_x**: 自变量。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `regr_intercept`

计算线性回归线的 y 截距。对于方程 \(y = kx + b\)，该函数返回 `b`。

```
regr_intercept(expression_y, expression_x)
```

###### 参数

- **expression_y**: 因变量。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **expression_x**: 自变量。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `regr_r2`

计算自变量和因变量之间的相关系数的平方。

```
regr_r2(expression_y, expression_x)
```

###### 参数

- **expression_y**: 因变量。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **expression_x**: 自变量。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `regr_sxx`

计算自变量的平方和。

```
regr_sxx(expression_y, expression_x)
```

###### 参数

- **expression_y**: 因变量。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **expression_x**: 自变量。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `regr_syy`

计算因变量的平方和。

```
regr_syy(expression_y, expression_x)
```

###### 参数

- **expression_y**: 因变量。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **expression_x**: 自变量。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `regr_sxy`

计算配对数据点的乘积和。

```
regr_sxy(expression_y, expression_x)
```

###### 参数

- **expression_y**: 因变量。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **expression_x**: 自变量。
  可以是常量、列或函数，以及任何组合的算术运算符。

### 近似

- [approx_distinct](#approx-distinct)
- [approx_median](#approx-median)
- [approx_percentile_cont](#approx-percentile-cont)
- [approx_percentile_cont_with_weight](#approx-percentile-cont-with-weight)

##### `approx_distinct`

使用HyperLogLog算法计算的近似不同输入值的数量。

```
approx_distinct(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `approx_median`

返回输入值的近似中位数（第50个百分位数）。
它是`approx_percentile_cont(x, 0.5)`的别名。

```
approx_median(expression)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。

##### `approx_percentile_cont`

使用t-digest算法返回输入值的近似百分位数。

```
approx_percentile_cont(expression, percentile, centroids)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **percentile**: 要计算的百分位数。必须是介于0和1之间（包括0和1）的浮点值。
- **centroids**: 在t-digest算法中使用的质心数量。_默认值为100_。

  如果唯一值少于或等于这个数量，您可以期望得到精确的结果。
  更高的质心数量会得到更准确的近似值，但需要更多的内存来计算。

##### `approx_percentile_cont_with_weight`

使用t-digest算法返回输入值的加权近似百分位数。

```
approx_percentile_cont_with_weight(expression, weight, percentile)
```

###### 参数

- **expression**: 要操作的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **weight**: 用作权重的表达式。
  可以是常量、列或函数，以及任何组合的算术运算符。
- **percentile**: 要计算的百分位数。必须是介于0和1之间（包括0和1）的浮点值。
<!---
  Licensed to the Apache Software Foundation (ASF) under one
  or more contributor license agreements.  See the NOTICE file
  distributed with this work for additional information
  regarding copyright ownership.  The ASF licenses this file
  to you under the Apache License, Version 2.0 (the
  "License"); you may not use this file except in compliance
  with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing,
  software distributed under the License is distributed on an
  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, either expressioness or implied.  See the License for the
  specific language governing permissions and limitations
  under the License.
-->

## 窗口函数

窗口函数是对与当前行相关的一组表行执行计算的函数。这类似于可以使用聚合函数进行的计算类型。然而，窗口函数不会导致行成为单个输出行，就像非窗口聚合调用那样。相反，行保留其各自的身份。在幕后，窗口函数能够访问查询结果的当前行以外的更多行。

下面是一个示例，展示了如何将每个员工的工资与其所在部门的平均工资进行比较：

```sql
SELECT depname, empno, salary, avg(salary) OVER (PARTITION BY depname) FROM empsalary;

+-----------+-------+--------+-------------------+
| depname   | empno | salary | avg               |
+-----------+-------+--------+-------------------+
| personnel | 2     | 3900   | 3700.0            |
| personnel | 5     | 3500   | 3700.0            |
| develop   | 8     | 6000   | 5020.0            |
| develop   | 10    | 5200   | 5020.0            |
| develop   | 11    | 5200   | 5020.0            |
| develop   | 9     | 4500   | 5020.0            |
| develop   | 7     | 4200   | 5020.0            |
| sales     | 1     | 5000   | 4866.666666666667 |
| sales     | 4     | 4800   | 4866.666666666667 |
| sales     | 3     | 4800   | 4866.666666666667 |
+-----------+-------+--------+-------------------+
```

窗口函数调用总是在窗口函数的名称和参数之后直接包含一个OVER子句。这在语法上区分它与普通函数或非窗口聚合函数。OVER子句确定了查询的行如何被分割以供窗口函数处理。OVER中的PARTITION BY子句将行分成具有相同PARTITION BY表达式值的组或分区。对于每一行，窗口函数在与当前行属于同一分区的行中进行计算。前面的示例展示了如何对每个分区计算平均值。

您还可以使用OVER中的ORDER BY控制窗口函数处理行的顺序。（窗口ORDER BY甚至不必与行的输出顺序匹配。）下面是一个示例：

```sql
SELECT depname, empno, salary,
  rank() OVER (PARTITION BY depname ORDER BY salary DESC)
FROM empsalary;

+-----------+-------+--------+--------+
| depname   | empno | salary | rank   |
+-----------+-------+--------+--------+
| personnel | 2     | 3900   | 1      |
| develop   | 8     | 6000   | 1      |
| develop   | 10    | 5200   | 2      |
| develop   | 11    | 5200   | 2      |
| develop   | 9     | 4500   | 4      |
| develop   | 7     | 4200   | 5      |
| sales     | 1     | 5000   | 1      |
| sales     | 4     | 4800   | 2      |
| personnel | 5     | 3500   | 2      |
| sales     | 3     | 4800   | 2      |
+-----------+-------+--------+--------+
```

窗口函数还有一个重要的概念：对于每一行，都有一组在其分区内的行称为窗口帧。某些窗口函数仅对窗口帧的行进行操作，而不是整个分区的行。下面是在查询中使用窗口帧的示例：

```sql
SELECT depname, empno, salary,
    avg(salary) OVER(ORDER BY salary ASC ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS avg,
    min(salary) OVER(ORDER BY empno ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_min
FROM empsalary
ORDER BY empno ASC;

+-----------+-------+--------+--------------------+---------+
| depname   | empno | salary | avg                | cum_min |
+-----------+-------+--------+--------------------+---------+
| sales     | 1     | 5000   | 5000.0             | 5000    |
| personnel | 2     | 3900   | 3866.6666666666665 | 3900    |
| sales     | 3     | 4800   | 4700.0             | 3900    |
| sales     | 4     | 4800   | 4866.666666666667  | 3900    |
| personnel | 5     | 3500   | 3700.0             | 3500    |
| develop   | 7     | 4200   | 4200.0             | 3500    |
| develop   | 8     | 6000   | 5600.0             | 3500    |
| develop   | 9     | 4500   | 4500.0             | 3500    |
| develop   | 10    | 5200   | 5133.333333333333  | 3500    |
| develop   | 11    | 5200   | 5466.666666666667  | 3500    |
+-----------+-------+--------+--------------------+---------+
```

当一个查询涉及多个窗口函数时，可以将每个函数都写成一个单独的OVER子句，但如果多个函数需要相同的窗口行为，则这样做会产生冗余并容易出错。相反，可以在WINDOW子句中为每个窗口行为命名，然后在OVER中引用。例如：

```sql
SELECT sum(salary) OVER w, avg(salary) OVER w
FROM empsalary
WINDOW w AS (PARTITION BY depname ORDER BY salary DESC);
```

### 语法

OVER子句的语法如下：

```
function([expr])
  OVER(
    [PARTITION BY expr[, …]]
    [ORDER BY expr [ ASC | DESC ][, …]]
    [ frame_clause ]
    )
```

其中**frame_clause**可以是以下之一：

```
  { RANGE | ROWS | GROUPS } frame_start
  { RANGE | ROWS | GROUPS } BETWEEN frame_start AND frame_end
```

而**frame_start**和**frame_end**可以是以下之一：

```sql
UNBOUNDED PRECEDING
offset PRECEDING
CURRENT ROW
offset FOLLOWING
UNBOUNDED FOLLOWING
```

其中**offset**是非负整数。

RANGE和GROUPS模式需要一个ORDER BY子句（对于RANGE，ORDER BY必须指定一个列）。

### 聚合函数

所有[聚合函数](#聚合函数)都可以用作窗口函数。

### 排名函数

- [row_number](#row-number)
- [rank](#rank)
- [dense_rank](#dense-rank)
- [ntile](#ntile)

##### `row_number`

当前行在其分区内的编号，从1开始计数。

```sql
row_number()
```

##### `rank`

当前行的排名，有间隔；与其第一个同级的行的row_number相同。

```sql
rank()
```

##### `dense_rank`

当前行的排名，没有间隔；此函数计算同级组。

```sql
dense_rank()
```

##### `ntile`

从1到参数值的整数，将分区均匀地分成若干组。

```sql
ntile(expression)
```

###### 参数

- **expression**：描述分区应分成的组数的整数

### 分析函数

- [cume_dist](#cume-dist)
- [percent_rank](#percent-rank)
- [lag](#lag)
- [lead](#lead)
- [first_value](#first-value)
- [last_value](#last-value)
- [nth_value](#nth-value)

##### `cume_dist`

当前行的相对排名：（在当前行之前或与当前行同级的行数）/（总行数）。

```sql
cume_dist()
```

##### `percent_rank`

当前行的相对排名：（排名 - 1）/（总行数 - 1）。

```sql
percent_rank()
```

##### `lag`

返回在分区内当前行之前偏移行数的行上评估的值；如果没有这样的行，则返回默认值（默认值必须与值的类型相同）。偏移和默认值都是相对于当前行进行评估的。如果省略，偏移默认为1，默认值默认为null。

```sql
lag(expression, offset, default)
```

###### 参数

- **expression**：要操作的表达式
- **offset**：整数。指定应从_expression_之前检索多少行的值。默认为1。
- **default**：如果偏移不在分区内，则为默认值。必须与_expression_的类型相同。

##### `lead`

返回在分区内当前行之后偏移行数的行上评估的值；如果没有这样的行，则返回默认值（默认值必须与值的类型相同）。偏移和默认值都是相对于当前行进行评估的。如果省略，偏移默认为1，默认值默认为null。

```sql
lead(expression, offset, default)
```

###### 参数

- **expression**：要操作的表达式
- **offset**：整数。指定应从_expression_之后检索多少行的值。默认为1。
- **default**：如果偏移不在分区内，则为默认值。必须与_expression_的类型相同。

##### `first_value`

返回窗口帧中第一行评估的值。

```sql
first_value(expression)
```

###### 参数

- **expression**: 要操作的表达式

##### `last_value`

返回窗口帧中最后一行评估的值。

```sql
last_value(expression)
```

###### 参数

- **expression**: 要操作的表达式

##### `nth_value`

返回窗口帧中第n行（从1开始计数）评估的值；如果没有这样的行，则返回null。

```sql
nth_value(expression, n)
```

###### 参数

- **expression**: 要操作的表达式的列名
- **n**: 整数。指定nth中的_n_
