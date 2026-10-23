---
keywords: [RustFS, 对象存储, S3 兼容, 存储配置, GreptimeDB]
description: 介绍如何使用 S3 兼容的对象存储 RustFS 作为 GreptimeDB 的存储后端，包括在本地启动 RustFS、创建 bucket 以及 GreptimeDB 的存储配置。
---

# 使用 RustFS 作为对象存储

[RustFS](https://rustfs.com) 是一个用 Rust 编写的开源 S3 兼容对象存储。GreptimeDB 通过标准的 `S3` 存储类型连接 RustFS，不需要任何 RustFS 特有的配置项。RustFS 官方也提供了一份 [GreptimeDB 集成指南](https://docs.rustfs.com/en/developer/integration/observability/greptimedb)。

## 启动 RustFS

使用 Docker 启动一个单节点 RustFS：

```bash
docker run -d --name rustfs -p 9000:9000 -p 9001:9001 rustfs/rustfs:latest
```

`9000` 端口提供 S3 API，`9001` 端口提供 Web 控制台。默认的 access key 和 secret key 都是 `rustfsadmin`，生产环境务必修改。

## 创建 bucket

GreptimeDB 不会自动创建 bucket，请先在 RustFS 中创建，可以通过控制台 `http://127.0.0.1:9001/rustfs/console/` 或任意 S3 客户端完成。下面的配置使用名为 `greptimedb` 的 bucket。如果 bucket 不存在，GreptimeDB 仍能正常启动，但第一条 `CREATE TABLE` 会因对象存储返回 404 而失败。

## 配置 GreptimeDB

在单机实例或每个 datanode 的配置文件中加入如下 `[storage]` 配置：

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

RustFS 使用 path-style 请求。GreptimeDB 对自定义 endpoint 默认就使用 path-style，因此无需设置 `enable_virtual_host_style`。其他 S3 配置项请参考[存储选项](/user-guide/deployments-administration/configuration.md#存储选项)。
