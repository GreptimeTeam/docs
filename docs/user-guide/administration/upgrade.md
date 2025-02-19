---
keywords: [GreptimeDB upgrade, CLI tool, data export, data import, schema export, schema import, upgrade example]
description: Instructions on upgrading GreptimeDB using the built-in CLI tool, including exporting and importing data and schemas, and a complete example for upgrading.
---

# Upgrade

Before upgrading to the latest version, it's recommended to upgrade your GreptimeDB deployment to `v0.11` first. You can refer to the upgrade guide for `v0.11` for more details.
This guide only covers the upgrade process from `v0.11` to the latest version.


## Upgrade from v0.11.x

The data format of the latest version is compatible with `v0.11.x`. You don't need to export and import data.
However, there are some breaking changes between `v0.11.x` and the latest version. You may need some manual operations to upgrade your GreptimeDB deployment.

### Update cache configuration

The cache configuration and default cache path changed in `v0.12`. The default read cache is under the `${data_home}/cache/object/read` and the default write cache is under the `${data_home}/cache/object/write` now.

The `cache_path` configuration only sets the home directory of the read cache.
GreptimeDB always uses the `cache/object/read` subdirectory under the cache home.
The default `cache_path` is the `${data_home}`.
It's recommended not to set the `cache_path` manually and let GreptimeDB manage the cache path.
You can remove the `cache_path` when you upgrade to `v0.12`.

```toml
[storage]
type = "S3"
bucket = "ap-southeast-1-test-bucket"
root = "your-root"
access_key_id = "****"
secret_access_key = "****"
endpoint = "https://s3.amazonaws.com/"
region = "your-region"
# No need to set cache_path manually.
# cache_path = "/path/to/cache/home"
cache_capacity = "10G"
```

Since `v0.12`, you don't need to add `experimental` to the write cache configuration. If you have the following configuration in `v0.11`:

```toml
[[region_engine]]
[region_engine.mito]
enable_experimental_write_cache = true
experimental_write_cache_size = "10G"
experimental_write_cache_ttl = "8h"
experimental_write_cache_path = "/path/to/write/cache"
```

You need to change it to:

```toml
[[region_engine]]
[region_engine.mito]
write_cache_size = "10G"
write_cache_ttl = "8h"
# No need to set write_cache_path manually.
# write_cache_path = "${data_home}"
```

The `write_cache_path` configuration only sets the home directory of the write cache.
GreptimeDB always uses the `cache/object/write` subdirectory under the cache home.
The default `write_cache_path` is the `${data_home}`.
It's recommended not to set the `write_cache_path` manually and let GreptimeDB manage the cache path.


You can also remove the legacy cache directory of your `cache_path` and `experimental_write_cache_path` to release disk space.
The legacy cache directory may be located at `${data_home}/object_cache/read`, `${data_home}/object_cache/write`, `${data_home}/write_cache`.


### Create index manually

Since `v0.12`, GreptimeDB does not create inverted index automatically for a table that uses mito engine.

You need to create index manually after upgrading to `v0.12`.
