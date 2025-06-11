---
keywords: [安卓平台, ARM64 CPU, Android API 23, Termux 终端模拟器, 二进制文件, 配置文件, 启动服务, 连接数据库]
description: 在安卓平台运行 GreptimeDB 的指南，包括安装终端模拟器、下载二进制文件、创建配置文件、启动服务和连接数据库的步骤。
---

# 在安卓平台运行

从 v0.4.0 开始，GreptimeDB 支持在采用了 ARM64 CPU 和 Android API 23 版本以上的安卓平台运行。

## 安装终端模拟器

您可以从 [GitHub release 页面](https://github.com/termux/termux-app/releases/latest) 下载 [Termux 终端模拟器](https://termux.dev/) 来运行 GreptimeDB.



## 下载 GreptimeDB 的二进制

请执行以下命令来下载安卓平台的 GreptimeDB 二进制：
```bash
VERSION=$(curl -sL \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "https://api.github.com/repos/GreptimeTeam/greptimedb/releases/latest" | sed -n 's/.*"tag_name": "\([^"]*\)".*/\1/p')


curl -sOL "https://github.com/GreptimeTeam/greptimedb/releases/download/${VERSION}/greptime-android-arm64-${VERSION}.tar.gz"
tar zxvf ./greptime-android-arm64-${VERSION}.tar.gz
./greptime -V
```

如果下载成功，以上命令将输出当前 GreptimeDB 的版本信息。

## 创建 GreptimeDB 的配置文件

您可以通过以下命令来创建一个最小化的配置文件以允许从局域网访问 GreptimeDB：

```bash
DATA_DIR="$(pwd)/greptimedb-data"
mkdir -p ${DATA_DIR}

cat <<EOF > ./config.toml
[http]
addr = "0.0.0.0:4000"

[grpc]
bind_addr = "0.0.0.0:4001"

[mysql]
addr = "0.0.0.0:4002"

[storage]
data_home = "${DATA_DIR}"
type = "File"
EOF
```

## 从命令行启动 GreptimeDB

```bash
./greptime --log-dir=$(pwd)/logs standalone start -c ./config.toml
```

## 从局域网连接运行在安卓设备上的 GreptimeDB

> 您可以通过`ifconfig`来获取您所使用的的安卓设备的网络地址。

在启动 GreptimeDB 后，您可以从局域网内安装了 MySQL 客户端的设备上通过 MySQL 协议访问 GreptimeDB。

```bash
mysql -h <ANDROID_DEVICE_IP_ADDR> -P 4002
```

连接成功后，您可以像在任何其他平台一样使用运行在安卓设备上的 GreptimeDB！

```
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 5.1.10-alpha-msql-proxy Greptime

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> CREATE TABLE monitor (env STRING, host STRING, ts TIMESTAMP, cpu DOUBLE DEFAULT 0, memory DOUBLE, TIME INDEX (ts), PRIMARY KEY(env,host));
Query OK, 0 rows affected (0.14 sec)

mysql> INSERT INTO monitor(ts, env, host, cpu, memory) VALUES
    -> (1655276557000,'prod', 'host1', 66.6, 1024),
    -> (1655276557000,'prod', 'host2', 66.6, 1024),
    -> (1655276557000,'prod', 'host3', 66.6, 1024),
    -> (1655276558000,'prod', 'host1', 77.7, 2048),
    -> (1655276558000,'prod', 'host2', 77.7, 2048),
    -> (1655276558000,'test', 'host3', 77.7, 2048),
    -> (1655276559000,'test', 'host1', 88.8, 4096),
    -> (1655276559000,'test', 'host2', 88.8, 4096),
    -> (1655276559000,'test', 'host3', 88.8, 4096);
Query OK, 9 rows affected (0.14 sec)

mysql>
mysql> select * from monitor where env='test' and host='host3';
+------+-------+---------------------+------+--------+
| env  | host  | ts                  | cpu  | memory |
+------+-------+---------------------+------+--------+
| test | host3 | 2022-06-15 15:02:38 | 77.7 |   2048 |
| test | host3 | 2022-06-15 15:02:39 | 88.8 |   4096 |
+------+-------+---------------------+------+--------+
2 rows in set (0.20 sec)
```
