---
keywords: ["IP", "IPv4", "IPv6", "CIDR", "地址", "网络", "范围", "转换", "操作", "SQL", "函数"]
description: 关于 IP 地址操作、字符串/数字格式转换、CIDR 表示法以及 IPv4 和 IPv6 范围检查的 SQL 函数文档。
---

import TOCInline from '@theme/TOCInline';

# IP 函数

<TOCInline toc={toc} />

本文档介绍了可用于 IP 地址操作和比较的函数。

### `ipv4_to_cidr(ip_string [, subnet_mask])`

**描述：**

将 IPv4 地址字符串转换为 CIDR 表示法。如果提供了 `subnet_mask` 参数（UInt8 类型，取值范围 0-32），则使用指定的子网掩码。否则，函数会根据输入字符串末尾的零或提供的八位字节数来自动检测子网（例如，'192.168' 表示 /16，'192' 表示 /8）。生成的 CIDR 表示法中的 IP 地址会根据子网掩码将主机位清零。

**参数：**

*   `ip_string`: String - IPv4 地址字符串（例如，'192.168.1.1'，'10.0.0.0'，'172.16'）。不完整的地址将用零补全。
*   `subnet_mask` (可选): UInt8 - 期望的子网掩码长度（例如，24, 16, 8）。

**返回类型：**

String - CIDR 表示法中的 IPv4 地址（例如，'192.168.1.0/24'）。若输入无效，则返回 NULL。

**示例：**

```sql
-- 自动检测子网
SELECT ipv4_to_cidr('192.168.1.0');
-- 输出: '192.168.1.0/24'

SELECT ipv4_to_cidr('172.16');
-- 输出: '172.16.0.0/16'

-- 指定子网掩码
SELECT ipv4_to_cidr('192.168.1.1', 24);
-- 输出: '192.168.1.0/24'

SELECT ipv4_to_cidr('10.0.0.1', 16);
-- 输出: '10.0.0.0/16'
```

### `ipv6_to_cidr(ip_string [, subnet_mask])`

**描述：**

将 IPv6 地址字符串转换为 CIDR 表示法。如果提供了 `subnet_mask` 参数（UInt8 类型，取值范围 0-128），则使用指定的子网掩码。否则，函数会尝试根据地址末尾的零段或常见前缀（如 `fe80::` 代表 /16 或 `2001:db8::` 代表 /32）来自动检测子网。生成的 CIDR 表示法中的 IP 地址会根据子网掩码将主机位清零。

**参数：**

*   `ip_string`: String - IPv6 地址字符串（例如，'2001:db8::1'，'fe80::'）。不完整的地址在可能的情况下会被补全（例如，'2001:db8' 变为 '2001:db8::'）。
*   `subnet_mask` (可选): UInt8 - 期望的子网掩码长度（例如，48, 64, 128）。

**返回类型：**

String - CIDR 表示法中的 IPv6 地址（例如，'2001:db8::/32'）。若输入无效，则返回 NULL。

**示例：**

```sql
-- 自动检测子网
SELECT ipv6_to_cidr('2001:db8::');
-- 输出: '2001:db8::/32'

SELECT ipv6_to_cidr('fe80::1');
-- 输出: 'fe80::/16'

SELECT ipv6_to_cidr('::1');
-- 输出: '::1/128'

-- 指定子网掩码
SELECT ipv6_to_cidr('2001:db8::', 48);
-- 输出: '2001:db8::/48'

SELECT ipv6_to_cidr('fe80::1', 10);
-- 输出: 'fe80::/10'
```

### `ipv4_num_to_string(ip_number)`

**描述：**

将 UInt32 类型的数字转换为标准的 A.B.C.D 格式的 IPv4 地址字符串。该数字被视为大端字节序（Big-Endian）的 IPv4 地址。

**参数：**

*   `ip_number`: UInt32 - IPv4 地址的数字形式。

**返回类型：**

String - 点分十进制表示法中的 IPv4 地址（例如，'192.168.0.1'）。

**示例：**

```sql
SELECT ipv4_num_to_string(3232235521); -- 0xC0A80001
-- 输出: '192.168.0.1'

SELECT ipv4_num_to_string(167772161); -- 0x0A000001
-- 输出: '10.0.0.1'

SELECT ipv4_num_to_string(0);
-- 输出: '0.0.0.0'
```

### `ipv4_string_to_num(ip_string)`

**描述：**

将 A.B.C.D 格式的 IPv4 地址字符串转换为其对应的 UInt32 数字（大端序）。

**参数：**

*   `ip_string`: String - 点分十进制表示法中的 IPv4 地址。

**返回类型：**

UInt32 - IPv4 地址的数字表示。若输入格式无效，则返回 NULL 或抛出错误。

**示例：**

```sql
SELECT ipv4_string_to_num('192.168.0.1');
-- 输出: 3232235521

SELECT ipv4_string_to_num('10.0.0.1');
-- 输出: 167772161

SELECT ipv4_string_to_num('0.0.0.0');
-- 输出: 0
```

### `ipv6_num_to_string(hex_string)`

**描述：**

将 32 个字符长的十六进制字符串（代表 IPv6 地址）转换为其标准格式的字符串表示（例如，'2001:db8::1'）。能正确处理 IPv4 映射的 IPv6 地址（例如，'::ffff:192.168.0.1'）。十六进制字符的大小写不敏感。

**参数：**

*   `hex_string`: String - 代表 IPv6 地址 16 个字节的 32 位十六进制字符串。

**返回类型：**

String - 标准格式的 IPv6 地址字符串。若输入不是有效的 32 位十六进制字符串，则返回 NULL 或抛出错误。

**示例：**

```sql
SELECT ipv6_num_to_string('20010db8000000000000000000000001');
-- 输出: '2001:db8::1'

SELECT ipv6_num_to_string('00000000000000000000ffffc0a80001');
-- 输出: '::ffff:192.168.0.1'
```

### `ipv6_string_to_num(ip_string)`

**描述：**

将标准格式的 IPv6 地址字符串或点分十进制格式的 IPv4 地址字符串转换为其 16 字节的二进制表示。如果输入是 IPv4 地址字符串，它会先被内部转换为 IPv6 映射的等价形式（例如，'192.168.0.1' 内部变为 '::ffff:192.168.0.1'），然后再转换为二进制表示。

**参数：**

*   `ip_string`: String - IPv6 或 IPv4 地址字符串。

**返回类型：**

Binary - IPv6 地址的 16 字节二进制数据。若输入格式无效，则返回 NULL 或抛出错误。

**示例：**

```sql
-- IPv6 输入
SELECT ipv6_string_to_num('2001:db8::1');
-- 输出: 2001:db8::1 的二进制表示

-- IPv4 输入 (映射到 IPv6)
SELECT ipv6_string_to_num('192.168.0.1');
-- 输出: ::ffff:192.168.0.1 的二进制表示

-- IPv4 映射的 IPv6 输入
SELECT ipv6_string_to_num('::ffff:192.168.0.1');
-- 输出: ::ffff:192.168.0.1 的二进制表示
```

### `ipv4_in_range(ip_string, cidr_string)`

**描述：**

检查给定的 IPv4 地址字符串是否落在指定的 CIDR 范围字符串之内。

**参数：**

*   `ip_string`: String - 待检查的 IPv4 地址（例如，'192.168.1.5'）。
*   `cidr_string`: String - 用于检查的 CIDR 范围（例如，'192.168.1.0/24'）。

**返回类型：**

Boolean - 如果 IP 地址在指定范围内，则返回 `true`，否则返回 `false`。若输入无效，则返回 NULL 或抛出错误。

**示例：**

```sql
SELECT ipv4_in_range('192.168.1.5', '192.168.1.0/24');
-- 输出: true

SELECT ipv4_in_range('192.168.2.1', '192.168.1.0/24');
-- 输出: false

SELECT ipv4_in_range('10.0.0.1', '10.0.0.0/8');
-- 输出: true

SELECT ipv4_in_range('8.8.8.8', '0.0.0.0/0'); -- /0 匹配所有地址
-- 输出: true

SELECT ipv4_in_range('192.168.1.1', '192.168.1.1/32'); -- /32 表示精确匹配单个地址
-- 输出: true
```

### `ipv6_in_range(ip_string, cidr_string)`

**描述：**

检查给定的 IPv6 地址字符串是否落在指定的 CIDR 范围字符串之内。

**参数：**

*   `ip_string`: String - 待检查的 IPv6 地址（例如，'2001:db8::1'）。
*   `cidr_string`: String - 用于检查的 CIDR 范围（例如，'2001:db8::/32'）。

**返回类型：**

Boolean - 如果 IP 地址在指定范围内，则返回 `true`，否则返回 `false`。若输入无效，则返回 NULL 或抛出错误。

**示例：**

```sql
SELECT ipv6_in_range('2001:db8::1', '2001:db8::/32');
-- 输出: true

SELECT ipv6_in_range('2001:db8:1::', '2001:db8::/32');
-- 输出: true

SELECT ipv6_in_range('2001:db9::1', '2001:db8::/32');
-- 输出: false

SELECT ipv6_in_range('::1', '::1/128');
-- 输出: true

SELECT ipv6_in_range('fe80::1', 'fe80::/16');
-- 输出: true
```
