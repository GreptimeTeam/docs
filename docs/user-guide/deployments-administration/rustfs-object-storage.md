---
keywords: [RustFS, Object Storage, S3-compatible, Storage Configuration, GreptimeDB]
description: How to use RustFS, an S3-compatible object storage, as the storage backend of GreptimeDB, including starting RustFS locally, creating a bucket, and the GreptimeDB storage configuration.
---

# Use RustFS as Object Storage

[RustFS](https://rustfs.com) is an open-source, S3-compatible object storage written in Rust. GreptimeDB connects to it through the standard `S3` storage type, so no RustFS-specific options are needed. RustFS also publishes a [GreptimeDB integration guide](https://docs.rustfs.com/en/developer/integration/observability/greptimedb) on its side.

## Start RustFS

Start a single RustFS instance with Docker:

```bash
docker run -d --name rustfs -p 9000:9000 -p 9001:9001 rustfs/rustfs:latest
```

Port `9000` serves the S3 API and port `9001` serves the web console. The default access key and secret key are both `rustfsadmin`. Change them before any production use.

## Create a bucket

GreptimeDB does not create the bucket automatically. Create it in RustFS first, through the console at `http://127.0.0.1:9001` or with any S3 client. The configuration below uses a bucket named `greptimedb`.

## Configure GreptimeDB

Add the following `[storage]` section to the configuration file of a standalone instance or of each datanode:

```toml
[storage]
type = "S3"
bucket = "greptimedb"
root = "greptimedb"
access_key_id = "rustfsadmin"
secret_access_key = "rustfsadmin"
endpoint = "http://127.0.0.1:9000"
region = "us-east-1"
```

RustFS serves path-style requests. GreptimeDB sends path-style requests to a custom endpoint by default, so you do not need to set `enable_virtual_host_style`. See [Storage options](/user-guide/deployments-administration/configuration.md#storage-options) for the other S3 options.

This setup has been verified with RustFS v1.0.3 and the GreptimeDB main branch as of October 2026.
