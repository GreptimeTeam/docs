---
keywords: ["IP", "IPv4", "IPv6", "CIDR", "address", "network", "range", "conversion", "manipulation", "SQL", "functions"]
description: Documentation for SQL functions related to IP address manipulation, conversion between string/numeric formats, CIDR notation, and range checking for both IPv4 and IPv6.
---

import TOCInline from '@theme/TOCInline';

# IP Functions

<TOCInline toc={toc} />

This document describes the IP address manipulation and comparison functions available.

### `ipv4_to_cidr(ip_string [, subnet_mask])`

**Description:**

Converts an IPv4 address string to CIDR notation. If a `subnet_mask` (UInt8, 0-32) is provided, it uses that mask. Otherwise, it automatically detects the subnet based on trailing zeros or the number of octets provided in the input string (e.g., '192.168' implies /16, '192' implies /8). The resulting IP address in the CIDR notation will have host bits zeroed out according to the mask.

**Arguments:**

*   `ip_string`: String - The IPv4 address string (e.g., '192.168.1.1', '10.0.0.0', '172.16'). Partial addresses are completed with zeros.
*   `subnet_mask` (Optional): UInt8 - The desired subnet mask length (e.g., 24, 16, 8).

**Return Type:**

String - The IPv4 address in CIDR notation (e.g., '192.168.1.0/24'). Returns NULL for invalid inputs.

**Examples:**

```sql
-- Auto-detect subnet
SELECT ipv4_to_cidr('192.168.1.0');
-- Output: '192.168.1.0/24'

SELECT ipv4_to_cidr('172.16');
-- Output: '172.16.0.0/16'

-- Explicit subnet mask
SELECT ipv4_to_cidr('192.168.1.1', 24);
-- Output: '192.168.1.0/24'

SELECT ipv4_to_cidr('10.0.0.1', 16);
-- Output: '10.0.0.0/16'
```

### `ipv6_to_cidr(ip_string [, subnet_mask])`

**Description:**

Converts an IPv6 address string to CIDR notation. If a `subnet_mask` (UInt8, 0-128) is provided, it uses that mask. Otherwise, it attempts to automatically detect the subnet based on trailing zero segments or common prefixes (like `fe80::` for /16 or `2001:db8::` for /32). The resulting IP address in the CIDR notation will have host bits zeroed out according to the mask.

**Arguments:**

*   `ip_string`: String - The IPv6 address string (e.g., '2001:db8::1', 'fe80::'). Partial addresses are completed if possible (e.g., '2001:db8' becomes '2001:db8::').
*   `subnet_mask` (Optional): UInt8 - The desired subnet mask length (e.g., 48, 64, 128).

**Return Type:**

String - The IPv6 address in CIDR notation (e.g., '2001:db8::/32'). Returns NULL for invalid inputs.

**Examples:**

```sql
-- Auto-detect subnet
SELECT ipv6_to_cidr('2001:db8::');
-- Output: '2001:db8::/32'

SELECT ipv6_to_cidr('fe80::1');
-- Output: 'fe80::/16'

SELECT ipv6_to_cidr('::1');
-- Output: '::1/128'

-- Explicit subnet mask
SELECT ipv6_to_cidr('2001:db8::', 48);
-- Output: '2001:db8::/48'

SELECT ipv6_to_cidr('fe80::1', 10);
-- Output: 'fe80::/10'
```

### `ipv4_num_to_string(ip_number)`

**Description:**

Converts a UInt32 number to an IPv4 address string in the standard A.B.C.D format. The number is interpreted as an IPv4 address in big-endian byte order.

**Arguments:**

*   `ip_number`: UInt32 - The numeric representation of the IPv4 address.

**Return Type:**

String - The IPv4 address in dot-decimal notation (e.g., '192.168.0.1').

**Examples:**

```sql
SELECT ipv4_num_to_string(3232235521); -- 0xC0A80001
-- Output: '192.168.0.1'

SELECT ipv4_num_to_string(167772161); -- 0x0A000001
-- Output: '10.0.0.1'

SELECT ipv4_num_to_string(0);
-- Output: '0.0.0.0'
```

### `ipv4_string_to_num(ip_string)`

**Description:**

Converts a string representation of an IPv4 address (A.B.C.D format) to its UInt32 numeric equivalent (big-endian).

**Arguments:**

*   `ip_string`: String - The IPv4 address in dot-decimal notation.

**Return Type:**

UInt32 - The numeric representation of the IPv4 address. Returns NULL or throws an error for invalid input formats.

**Examples:**

```sql
SELECT ipv4_string_to_num('192.168.0.1');
-- Output: 3232235521

SELECT ipv4_string_to_num('10.0.0.1');
-- Output: 167772161

SELECT ipv4_string_to_num('0.0.0.0');
-- Output: 0
```

### `ipv6_num_to_string(hex_string)`

**Description:**

Converts a 32-character hexadecimal string representation of an IPv6 address to its standard formatted string representation (e.g., '2001:db8::1'). Handles IPv4-mapped IPv6 addresses correctly (e.g., '::ffff:192.168.0.1'). Case-insensitive for hex characters.

**Arguments:**

*   `hex_string`: String - A 32-character hexadecimal string representing the 16 bytes of an IPv6 address.

**Return Type:**

String - The formatted IPv6 address string. Returns NULL or throws an error if the input is not a valid 32-character hex string.

**Examples:**

```sql
SELECT ipv6_num_to_string('20010db8000000000000000000000001');
-- Output: '2001:db8::1'

SELECT ipv6_num_to_string('00000000000000000000ffffc0a80001');
-- Output: '::ffff:192.168.0.1'
```

### `ipv6_string_to_num(ip_string)`

**Description:**

Converts a string representation of an IPv6 address (standard format) or an IPv4 address (dot-decimal format) to its 16-byte binary representation. If an IPv4 address string is provided, it is converted to its IPv6-mapped equivalent (e.g., '192.168.0.1' becomes '::ffff:192.168.0.1' internally before conversion to binary).

**Arguments:**

*   `ip_string`: String - The IPv6 or IPv4 address string.

**Return Type:**

Binary - The 16-byte binary representation of the IPv6 address. Returns NULL or throws an error for invalid input formats.

**Examples:**

```sql
-- IPv6 input
SELECT ipv6_string_to_num('2001:db8::1');
-- Output: Binary representation of 2001:db8::1

-- IPv4 input (gets mapped to IPv6)
SELECT ipv6_string_to_num('192.168.0.1');
-- Output: Binary representation of ::ffff:192.168.0.1

-- IPv4-mapped IPv6 input
SELECT ipv6_string_to_num('::ffff:192.168.0.1');
-- Output: Binary representation of ::ffff:192.168.0.1
```

### `ipv4_in_range(ip_string, cidr_string)`

**Description:**

Checks if a given IPv4 address string falls within a specified CIDR range string.

**Arguments:**

*   `ip_string`: String - The IPv4 address to check (e.g., '192.168.1.5').
*   `cidr_string`: String - The CIDR range to check against (e.g., '192.168.1.0/24').

**Return Type:**

Boolean - `true` if the IP address is within the range, `false` otherwise. Returns NULL or throws an error for invalid inputs.

**Examples:**

```sql
SELECT ipv4_in_range('192.168.1.5', '192.168.1.0/24');
-- Output: true

SELECT ipv4_in_range('192.168.2.1', '192.168.1.0/24');
-- Output: false

SELECT ipv4_in_range('10.0.0.1', '10.0.0.0/8');
-- Output: true

SELECT ipv4_in_range('8.8.8.8', '0.0.0.0/0'); -- /0 matches everything
-- Output: true

SELECT ipv4_in_range('192.168.1.1', '192.168.1.1/32'); -- /32 is an exact match
-- Output: true
```

### `ipv6_in_range(ip_string, cidr_string)`

**Description:**

Checks if a given IPv6 address string falls within a specified CIDR range string.

**Arguments:**

*   `ip_string`: String - The IPv6 address to check (e.g., '2001:db8::1').
*   `cidr_string`: String - The CIDR range to check against (e.g., '2001:db8::/32').

**Return Type:**

Boolean - `true` if the IP address is within the range, `false` otherwise. Returns NULL or throws an error for invalid inputs.

**Examples:**

```sql
SELECT ipv6_in_range('2001:db8::1', '2001:db8::/32');
-- Output: true

SELECT ipv6_in_range('2001:db8:1::', '2001:db8::/32');
-- Output: true

SELECT ipv6_in_range('2001:db9::1', '2001:db8::/32');
-- Output: false

SELECT ipv6_in_range('::1', '::1/128');
-- Output: true

SELECT ipv6_in_range('fe80::1', 'fe80::/16');
-- Output: true
```
