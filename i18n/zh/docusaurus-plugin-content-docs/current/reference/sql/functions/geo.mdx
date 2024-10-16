import TOCInline from '@theme/TOCInline';

# 地理函数

这个页面列出了GreptimeDB中的所有地理空间相关函数。当您启用了
`common-function/geo` 特性（默认为开启状态）时，这些函数才会生效。

<TOCInline toc={toc} />

## Geohash

了解 [更多关于 geohash 编码](https://en.wikipedia.org/wiki/Geohash)。

### `geohash`

从纬度、经度和分辨率获取geohash编码的字符串。

```sql
SELECT geohash(37.76938, -122.3889, 11);
```

### `geohash_neighbours`

给定坐标和分辨率获取所有 geohash 邻接点。

请注意，此函数返回一个字符串数组，并且仅在我们的HTTP查询API和Postgres通道上生效。

```sql
SELECT geohash_neighbours(37.76938, -122.3889, 11);
```

## H3

H3 地理坐标编码算法。[了解更多](https://h3geo.org/)。

### `h3_latlng_to_cell`

将坐标（纬度，经度）编码为指定分辨率下的 h3 索引，并返回该单元格的 UInt64 表示。

```sql
SELECT h3_latlng_to_cell(37.76938, -122.3889, 1);
```

### `h3_latlng_to_cell_string`

类似于 `h3_latlng_to_cell` ，但返回字符串编码格式。

```sql
h3_latlng_to_cell_string(37.76938, -122.3889, 1);
```

### `h3_cell_to_string`

将单元格索引（UInt64）转换为其字符串表示形式。

```sql
SELECT h3_cell_to_string(h3_latlng_to_cell(37.76938, -122.3889, 8));
```

### `h3_string_to_cell`

将十六进制编码的单元 ID 转换为其 UInt64 形式。

```sql
h3_string_to_cell(h3_latlng_to_cell_string(37.76938, -122.3889, 8::UInt64));
```

### `h3_cell_center_latlng`

返回单元中心的纬度和经度。

请注意，此函数返回一个浮点数数组，并且仅在我们的HTTP查询API和Postgres通道上有效。

```sql
SELECT h3_cell_center_latlng(h3_latlng_to_cell(37.76938, -122.3889, 8));
```

### `h3_cell_resolution`

给定单元格的返回分辨率。

```sql
SELECT h3_cell_resolution(h3_latlng_to_cell(37.76938, -122.3889, 8));
```

### `h3_cell_base`

返回给定单元的 Base 单元。

```sql
SELECT h3_cell_base(h3_latlng_to_cell(37.76938, -122.3889, 8));
```

### `h3_cell_is_pentagon`

如果单元格是五边形，则返回真。

```sql
SELECT h3_cell_is_pentagon(h3_latlng_to_cell(37.76938, -122.3889, 8));
```

### `h3_cell_parent`

返回给定分辨率下单元的父单元。

```sql
h3_cell_parent(h3_latlng_to_cell(37.76938, -122.3889, 8), 6);
```

### `h3_cell_to_children`

根据给定的分辨率返回子单元格。

请注意，此函数返回一个 UInt64 数组，并且仅在我们的 HTTP 查询 API 和 Postgres 通道上生效。

```sql
h3_cell_to_children(h3_latlng_to_cell(37.76938, -122.3889, 8), 10);
```

### `h3_cell_to_children_size`

根据给定的分辨率，返回单元格中的子单元数量。


```sql
h3_cell_to_children_size(h3_latlng_to_cell(37.76938, -122.3889, 8), 10);
```

### `h3_cell_to_child_pos`

根据给定分辨率，返回单元在其父单元的位置。位置是单元在所有子单元中的索引。

```sql
h3_cell_to_child_pos(h3_latlng_to_cell(37.76938, -122.3889, 8), 6)
```

### `h3_child_pos_to_cell`

在给定分辨率下，返回父单元中给定位置的单元。

参数：

- 位置
- 单元索引
- 分辨率

```sql
h3_child_pos_to_cell(25, h3_latlng_to_cell(37.76938, -122.3889, 8), 11);
```

### `h3_grid_disk`

返回给定单元格的 k 个距离对应的单元格。

请注意，此函数返回一个 UInt64 数组，并且仅能在我们的 HTTP 查询 API 和 Postgres 通道上工作。

```sql
h3_grid_disk(h3_latlng_to_cell(37.76938, -122.3889, 8), 3);
```

### `h3_grid_disk_distances`

返回给定单元格范围内所有距离为 *k* 的单元格。

请注意，此函数返回一个 UInt64 数组，并且仅适用于我们的 HTTP 查询 API 和 Postgres 通道。

```sql
h3_grid_disk_distance(h3_latlng_to_cell(37.76938, -122.3889, 8), 3);
```

### `h3_grid_distance`

返回两单元的距离。

```sql
SELECT
    h3_grid_distance(cell1, cell2) AS distance,
FROM
    (
      SELECT
          h3_latlng_to_cell(37.76938, -122.3889, 8) AS cell1,
          h3_latlng_to_cell(39.634, -104.999, 8) AS cell2
    );
```

### `h3_grid_path_cells`

此函数可在两个单元格之间返回路径单元格。请注意，如果两个单元格相距很远，该函数可能会失败。

```sql
SELECT
    h3_grid_path_cells(cell1, cell2) AS path_cells,
FROM
    (
      SELECT
          h3_latlng_to_cell(37.76938, -122.3889, 8) AS cell1,
          h3_latlng_to_cell(39.634, -104.999, 8) AS cell2
    );
```

## S2

了解[更多关于 S2 编码的信息](http://s2geometry.io/).

### `s2_latlng_to_cell`

给定坐标对应的 s2 单元索引。

```sql
SELECT s2_latlng_to_cell(37.76938, -122.3889);
```

### `s2_cell_to_token`

给定单元格的字符串表示形式。

```sql
SELECT s2_cell_to_token(s2_latlng_to_cell(37.76938, -122.3889));
```

### `s2_cell_level`

返回给定单元格的级别。

```sql
SELECT s2_cell_level(s2_latlng_to_cell(37.76938, -122.3889));
```

### `s2_cell_parent`

返回给定单元格位于特定级别的父单元。

```sql
SELECT s2_cell_parent(s2_latlng_to_cell(37.76938, -122.3889), 3);
```

## Encodings

### `json_encode_path`

将纬度、经度按时间戳排序并编码为一个 JSON 数组。

参数：

- 纬度
- 经度
- 时间戳

返回一个字符串类型的JSON数组。请注意，结果坐标中的顺序为 [经度, 纬度]，以符合 GeoJSON 规范。

```sql
SELECT json_encode_path(lat, lon, ts);
```

示例输出：

```json
[[-122.3888,37.77001],[-122.3839,37.76928],[-122.3889,37.76938],[-122.382,37.7693]]
```
