import TOCInline from '@theme/TOCInline';

# Geospatial Functions

This page lists all geospatial related functions in GreptimeDB. These functions
are enabled when you have `common-function/geo` feature turned on (default: on).

<TOCInline toc={toc} />

## Geohash

See [more about geohash encoding
algorithms](https://en.wikipedia.org/wiki/Geohash).

### `geohash`

Get geohash encoded string from latitude, longitude and resolution.

```sql
SELECT geohash(37.76938, -122.3889, 11);
```

### `geohash_neighbours`

Get all geohash neighbours for given coordinate and resolution.

Note that this function returns a String array and it only works on our HTTP
Query API and Postgres channel.

```sql
SELECT geohash_neighbours(37.76938, -122.3889, 11);
```

## H3

H3 is a geospatial index algorithm. See [more about h3
encoding](https://h3geo.org/).

### `h3_latlng_to_cell`

Encode coordinate (latitude, longitude) into h3 index at given
resolution. Returns UInt64 representation of the cell.

```sql
SELECT h3_latlng_to_cell(37.76938, -122.3889, 1);
```

### `h3_latlng_to_cell_string`

Similar to `h3_latlng_to_cell` but returns hex encoding of the cell.

```sql
h3_latlng_to_cell_string(37.76938, -122.3889, 1);
```

### `h3_cell_to_string`

Convert cell index (UInt64) to its string representation.

```sql
SELECT h3_cell_to_string(h3_latlng_to_cell(37.76938, -122.3889, 8));
```

### `h3_string_to_cell`

Convert hex-encoded cell ID to its UInt64 form

```sql
h3_string_to_cell(h3_latlng_to_cell_string(37.76938, -122.3889, 8::UInt64));
```

### `h3_cell_center_latlng`

Returns cell centroid as latitude and longitude.

Note that this function returns a Float array and it only works on our HTTP
Query API and Postgres channel.

```sql
SELECT h3_cell_center_latlng(h3_latlng_to_cell(37.76938, -122.3889, 8));
```

### `h3_cell_resolution`

Returns resolution for given cell.

```sql
SELECT h3_cell_resolution(h3_latlng_to_cell(37.76938, -122.3889, 8));
```

### `h3_cell_base`

Returns the base cell of given cell.

```sql
SELECT h3_cell_base(h3_latlng_to_cell(37.76938, -122.3889, 8));
```

### `h3_cell_is_pentagon`

Returns true if cell is a pentagon.

```sql
SELECT h3_cell_is_pentagon(h3_latlng_to_cell(37.76938, -122.3889, 8));
```

### `h3_cell_parent`

Returns parent cell at given resolution.

```sql
h3_cell_parent(h3_latlng_to_cell(37.76938, -122.3889, 8), 6);
```

### `h3_cell_to_children`

Returns children cells at given resolution.

Note that this function returns a UInt64 array and it only works on our HTTP
Query API and Postgres channel.

```sql
h3_cell_to_children(h3_latlng_to_cell(37.76938, -122.3889, 8), 10);
```

### `h3_cell_to_children_size`

Returns cell children count at given resolution.

```sql
h3_cell_to_children_size(h3_latlng_to_cell(37.76938, -122.3889, 8), 10);
```

### `h3_cell_to_child_pos`

Return the child position for its parent at given resolution. Position is the
index of child in its children.

```sql
h3_cell_to_child_pos(h3_latlng_to_cell(37.76938, -122.3889, 8), 6)
```

### `h3_child_pos_to_cell`

Returns the cell at given position of the parent at given resolution.

Arguments:

- position
- cell index
- resolution

```sql
h3_child_pos_to_cell(25, h3_latlng_to_cell(37.76938, -122.3889, 8), 11);
```

### `h3_grid_disk`

Returns cells with k distances of given cell.

Note that this function returns a UInt64 array and it only works on our HTTP
Query API and Postgres channel.

```sql
h3_grid_disk(h3_latlng_to_cell(37.76938, -122.3889, 8), 3);
```

### `h3_grid_disk_distances`

Returns all cells **within** k distances of given cell.

Note that this function returns a UInt64 array and it only works on our HTTP
Query API and Postgres channel.

```sql
h3_grid_disk_distance(h3_latlng_to_cell(37.76938, -122.3889, 8), 3);
```

### `h3_grid_distance`

Returns distance between two cells.

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

Returns path cells between two cells. Note that this function can fail if two
cells are very far apart.

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

Learn [more about S2 encoding](http://s2geometry.io/).

### `s2_latlng_to_cell`

Returns s2 cell index of given coordinate.

```sql
SELECT s2_latlng_to_cell(37.76938, -122.3889);
```

### `s2_cell_to_token`

Returns string representation of given cell.

```sql
SELECT s2_cell_to_token(s2_latlng_to_cell(37.76938, -122.3889));
```

### `s2_cell_level`

Returns s2 level of given cell.

```sql
SELECT s2_cell_level(s2_latlng_to_cell(37.76938, -122.3889));
```

### `s2_cell_parent`

Returns parent of given cell at level.

```sql
SELECT s2_cell_parent(s2_latlng_to_cell(37.76938, -122.3889), 3);
```

## Encodings

### `json_encode_path`

Encode rows of latitude, longitude in a JSON array, sorted by timestamp.

Arguments:

- latitude
- longitude
- timestamp

Returns a JSON array in string type. Note that the sequence in result coordinate
is [longitude, latitude] to align with GeoJSON spec.

```sql
SELECT json_encode_path(lat, lon, ts);
```

Example output:

```json
[[-122.3888,37.77001],[-122.3839,37.76928],[-122.3889,37.76938],[-122.382,37.7693]]
```
