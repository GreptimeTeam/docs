---
keywords: [geospatial functions, geo types, geohash, H3, spatial measurement]
description: Lists all geospatial related functions in GreptimeDB, including their usage, examples, and details on geospatial types, geohash, H3, S2, and encodings.
---

import TOCInline from '@theme/TOCInline';

# Geospatial Functions

This page lists all geospatial related functions in GreptimeDB. These functions
are enabled when you have `common-function/geo` feature turned on (default: on).

<TOCInline toc={toc} />

## Geo Types

Convert data between geospatial types.

### `wkt_point_from_latlng`

Convert latitude and longitude to WKT point.

```sql
SELECT wkt_point_from_latlng(37.76938, -122.3889) AS point;
```

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

### `h3_cells_contains`

Return true if given cells contains cell, or cell's parent.

Arguments:

- cell set: it can be int64/uint64/string array, and comma-separated string cell
  ID.
- cell index: the cell to test

```sql
SELECT
    h3_cells_contains('86283470fffffff,862834777ffffff, 862834757ffffff, 86283471fffffff, 862834707ffffff', '8b283470d112fff') AS R00,
    h3_cells_contains(['86283470fffffff', '862834777ffffff', '862834757ffffff', '86283471fffffff', '862834707ffffff'], '8b283470d112fff') AS R11,
    h3_cells_contains([604189641255419903, 604189643000250367, 604189642463379455, 604189641523855359, 604189641121202175], 604189641792290815) AS R21;
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

### `h3_distance_sphere_km`

Returns sphere distance between centroid of two cells, in km

```sql
SELECT
    round(h3_distance_sphere_km(cell1, cell2), 5) AS sphere_distance
FROM
    (
      SELECT
          h3_string_to_cell('86283082fffffff') AS cell1,
          h3_string_to_cell('86283470fffffff') AS cell2
    );

```

### `h3_distance_degree`

Returns euclidean distance between centroid of two cells, in degree.

```sql
SELECT
    round(h3_distance_degree(cell1, cell2), 14) AS euclidean_distance
FROM
    (
      SELECT
          h3_string_to_cell('86283082fffffff') AS cell1,
          h3_string_to_cell('86283470fffffff') AS cell2
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

## Spatial Relation

### `st_contains`

Test spatial relationship between two objects: contains.

Arguments: two spatial objects encoded with WKT.

```sql
SELECT
    st_contains(polygon1, p1),
    st_contains(polygon2, p1),
FROM
    (
        SELECT
            wkt_point_from_latlng(37.383287, -122.01325) AS p1,
            'POLYGON ((-122.031661 37.428252, -122.139829 37.387072, -122.135365 37.361971, -122.057759 37.332222, -121.987707 37.328946, -121.943754 37.333041, -121.919373 37.349145, -121.945814 37.376705, -121.975689 37.417345, -121.998696 37.409164, -122.031661 37.428252))' AS polygon1,
            'POLYGON ((-121.491698 38.653343, -121.582353 38.556757, -121.469721 38.449287, -121.315883 38.541721, -121.491698 38.653343))' AS polygon2,
    );

```

### `st_within`

Test spatial relationship between two objects: within.

Arguments: two spatial objects encoded with WKT.

```sql
SELECT
    st_within(p1, polygon1),
    st_within(p1, polygon2),
 ROM
    (
        SELECT
            wkt_point_from_latlng(37.383287, -122.01325) AS p1,
            'POLYGON ((-122.031661 37.428252, -122.139829 37.387072, -122.135365 37.361971, -122.057759 37.332222, -121.987707 37.328946, -121.943754 37.333041, -121.919373 37.349145, -121.945814 37.376705, -121.975689 37.417345, -121.998696 37.409164, -122.031661 37.428252))' AS polygon1,
            'POLYGON ((-121.491698 38.653343, -121.582353 38.556757, -121.469721 38.449287, -121.315883 38.541721, -121.491698 38.653343))' AS polygon2,
    );

```


### `st_intersects`

Test spatial relationship between two objects: intersects.

Arguments: two spatial objects encoded with WKT.

```sql
SELECT
    st_intersects(polygon1, polygon2),
    st_intersects(polygon1, polygon3),
FROM
    (
        SELECT
            'POLYGON ((-122.031661 37.428252, -122.139829 37.387072, -122.135365 37.361971, -122.057759 37.332222, -121.987707 37.328946, -121.943754 37.333041, -121.919373 37.349145, -121.945814 37.376705, -121.975689 37.417345, -121.998696 37.409164, -122.031661 37.428252))' AS polygon1,
            'POLYGON ((-121.491698 38.653343, -121.582353 38.556757, -121.469721 38.449287, -121.315883 38.541721, -121.491698 38.653343))' AS polygon2,
            'POLYGON ((-122.089628 37.450332, -122.20535 37.378342, -122.093062 37.36088, -122.044301 37.372886, -122.089628 37.450332))' AS polygon3,
    );

```


## Spatial Measurement

### `st_distance`

Returns WGS84(SRID: 4326) euclidean distance between two geometry object, in
degree.

Arguments: two spatial objects encoded with WKT.

```sql
SELECT
    st_distance(p1, p2) AS euclidean_dist,
    st_distance(p1, polygon1) AS euclidean_dist_pp,
FROM
    (
        SELECT
            wkt_point_from_latlng(37.76938, -122.3889) AS p1,
            wkt_point_from_latlng(38.5216, -121.4247) AS p2,
            'POLYGON ((-121.491698 38.653343, -121.582353 38.556757, -121.469721 38.449287, -121.315883 38.541721, -121.491698 38.653343))' AS polygon1,
    );
```

### `st_distance_sphere_m`

Return great circle distance between two point, in meters.

Arguments: two spatial objects encoded with WKT.

```sql
SELECT
    st_distance_sphere_m(p1, p2) AS sphere_dist_m,
FROM
    (
        SELECT
            wkt_point_from_latlng(37.76938, -122.3889) AS p1,
            wkt_point_from_latlng(38.5216, -121.4247) AS p2,
    );

```

### `st_area`

Returns area of given geometry object.

Arguments: the spatial object encoded with WKT.

```sql
SELECT
    st_area(p1) as area_point,
    st_area(polygon1) as area_polygon,
FROM
    (
        SELECT
            wkt_point_from_latlng(37.76938, -122.3889) AS p1,
            'POLYGON ((-121.491698 38.653343, -121.582353 38.556757, -121.469721 38.449287, -121.315883 38.541721, -121.491698 38.653343))' AS polygon1,
    );
```
