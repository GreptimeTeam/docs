---
keywords: [Android, Termux, installation, configuration, database, ARM64]
description: Instructions for running GreptimeDB on Android platforms, including installation of Termux, downloading the GreptimeDB binary, creating a configuration file, starting the database, and connecting to it from another device.
---

# Run on Android Platforms

Since v0.4.0, GreptimeDB supports running on Android platforms with ARM64 CPU and Android API level >= 23.

## Install terminal emulator on Android

You can install [Termux](https://termux.dev/) from [GitHub release page](https://github.com/termux/termux-app/releases/latest).


## Download GreptimeDB Android binary.

```bash
VERSION=$(curl -sL \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "https://api.github.com/repos/GreptimeTeam/greptimedb/releases/latest" | sed -n 's/.*"tag_name": "\([^"]*\)".*/\1/p')

curl -sOL "https://github.com/GreptimeTeam/greptimedb/releases/download/${VERSION}/greptime-android-arm64-${VERSION}.tar.gz"
tar zxvf ./greptime-android-arm64-${VERSION}.tar.gz
./greptime -V
```

If binary's downloaded correctly, the command is expected to print the version of downloaded binary.

## Create GreptimeDB configuration file 

You can create a minimal configuration file that allows access from local network.

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

## Start GreptimeDB from command line

```bash
./greptime --log-dir=$(pwd)/logs standalone start -c ./config.toml
```

## Connect to GreptimeDB running on Android
> You can find the IP address of your Android device from system settings or `ifconfig`.

You can now connect to the GreptimeDB instance running on Android from another device with MySQL client installed.

```bash
mysql -h <ANDROID_DEVICE_IP_ADDR> -P 4002
```

And play like on any other platforms!
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
