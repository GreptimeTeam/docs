---
keywords: [Kubernetes 部署, GreptimeDB 基础环境, 测试，工具]
description: 在 Kubernetes 上部署 GreptimeDB 基础环境测试工具。
---

# 部署 GreptimeDB 环境测试

在该指南中，你将学会如何在 Kubernetes 上部署 GreptimeDB 基础环境测试工具。

import PreKindHelm from './_pre_kind_helm.mdx';

<PreKindHelm />

## 配置

创建自定义配置文件 `infra-test-values.yaml`:

```yaml
image:
  # -- The image registry
  registry: greptime-registry.cn-hangzhou.cr.aliyuncs.com
  # -- The image repository
  repository: greptime/greptime-tool
  # -- The image tag
  tag: "20260521-c19a702"
  # -- The image pull secrets
  pullSecrets: []

# -- Configure to the tests
case:
  disk:
    enabled: true
    storageClass: null
    size: 20Gi

  cpu:
    enabled: true

  rds:
    enabled: true
    host: "your-rds-host"
    port: 3306
    database: "test"
    username: "your-rds-username"
    password: "your-rds-password"

  s3:
    enabled: true
    bucket: "bucket-name"
    region: "s3-region"
    accessKeyID: "your-access-key-id"
    secretAccessKey: "your-secret-access-key"

  kafka:
    enabled: true
    endpoint: "your-kafka-endpoint"
```

## 安装

使用自定义配置安装:

```bash
helm upgrade --install greptimedb-infra-test greptime/greptimedb-infra-test \
  --values infra-test-values.yaml \
  -n default
```

## 查看测试结果

测试工具以 kubernetes job 方式运行，结果输出在 pod 日志中:

```bash
kubectl get pod -n default
```

<details>
  <summary>期望输出</summary>
```bash
NAMESPACE   NAME                             READY   STATUS      RESTARTS   AGE
default     greptimedb-infra-test-n7z74      0/1     Completed   0          10m
```
</details>

```bash
kubectl logs greptimedb-infra-test-n7z74 -n default
```

<details>
  <summary>期望输出</summary>
```bash
================== Starting testing... ==================

================== Disk tests ==================

================== Running full I/O test ==================
seq-read: (g=0): rw=read, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=libaio, iodepth=64
seq-write: (g=0): rw=write, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=libaio, iodepth=64
rand-iops: (g=0): rw=randrw, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=libaio, iodepth=256
...
fio-3.28
Starting 6 processes
seq-read: Laying out IO file (1 file / 1024MiB)

seq-read: (groupid=0, jobs=6): err= 0: pid=14: Thu May 21 19:01:15 2026
read: IOPS=48.2k, BW=188MiB/s (198MB/s)(11.1GiB/60436msec)
slat (nsec): min=625, max=615290k, avg=53392.68, stdev=2634423.19
clat (nsec): min=875, max=636646k, avg=7912987.95, stdev=30341131.85
lat (usec): min=52, max=636649, avg=7966.49, stdev=30463.52
clat percentiles (usec):
|  1.00th=[   223],  5.00th=[   375], 10.00th=[   562], 20.00th=[   979],
| 30.00th=[  1303], 40.00th=[  1680], 50.00th=[  2311], 60.00th=[  3490],
| 70.00th=[  4752], 80.00th=[  6128], 90.00th=[ 13042], 95.00th=[ 23725],
| 99.00th=[103285], 99.50th=[270533], 99.90th=[421528], 99.95th=[438305],
| 99.99th=[488637]
bw (  KiB/s): min= 9969, max=450583, per=99.87%, avg=192706.79, stdev=24021.38, samples=596
iops        : min= 2490, max=112644, avg=48175.32, stdev=6005.33, samples=596
write: IOPS=34.0k, BW=133MiB/s (139MB/s)(8021MiB/60436msec); 0 zone resets
slat (nsec): min=708, max=615509k, avg=77566.35, stdev=3387406.46
clat (usec): min=241, max=640859, avg=22321.94, stdev=54921.92
lat (usec): min=281, max=640862, avg=22399.63, stdev=55019.71
clat percentiles (msec):
|  1.00th=[    3],  5.00th=[    5], 10.00th=[    7], 20.00th=[    8],
| 30.00th=[    9], 40.00th=[   10], 50.00th=[   11], 60.00th=[   12],
| 70.00th=[   14], 80.00th=[   16], 90.00th=[   26], 95.00th=[   54],
| 99.00th=[  359], 99.50th=[  414], 99.90th=[  485], 99.95th=[  502],
| 99.99th=[  634]
bw (  KiB/s): min=15032, max=284142, per=99.98%, avg=135879.94, stdev=12430.31, samples=596
iops        : min= 3757, max=71033, avg=33968.77, stdev=3107.56, samples=596
lat (nsec)   : 1000=0.01%
lat (usec)   : 20=0.01%, 50=0.01%, 100=0.01%, 250=0.95%, 500=3.99%
lat (usec)   : 750=3.41%, 1000=3.77%
lat (msec)   : 2=15.07%, 4=11.77%, 10=31.21%, 20=20.84%, 50=5.71%
lat (msec)   : 100=1.14%, 250=0.99%, 500=1.12%, 750=0.02%
cpu          : usr=1.88%, sys=8.37%, ctx=786665, majf=0, minf=263
IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=0.1%, 32=0.1%, >=64=100.0%
submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.1%, >=64=0.1%
issued rwts: total=2915521,2053386,0,0 short=0,0,0,0 dropped=0,0,0,0
latency   : target=0, window=0, percentile=100.00%, depth=256

Run status group 0 (all jobs):
READ: bw=188MiB/s (198MB/s), 188MiB/s-188MiB/s (198MB/s-198MB/s), io=11.1GiB (11.9GB), run=60436-60436msec
WRITE: bw=133MiB/s (139MB/s), 133MiB/s-133MiB/s (139MB/s-139MB/s), io=8021MiB (8411MB), run=60436-60436msec

Disk stats (read/write):
vda: ios=2915375/2054793, merge=4/1130, ticks=8259465/6477837, in_queue=14772291, util=82.28%

================== Running mixed read/write test ==================
fiotest: (g=0): rw=rw, bs=(R) 64.0KiB-64.0KiB, (W) 64.0KiB-64.0KiB, (T) 64.0KiB-64.0KiB, ioengine=libaio, iodepth=16
...
fio-3.28
Starting 8 processes
fiotest: Laying out IO file (1 file / 1024MiB)

fiotest: (groupid=0, jobs=8): err= 0: pid=22: Thu May 21 19:02:19 2026
read: IOPS=42.5k, BW=2657MiB/s (2786MB/s)(4092MiB/1540msec)
slat (nsec): min=1541, max=3755.0k, avg=6912.45, stdev=28881.60
clat (usec): min=30, max=52156, avg=1045.12, stdev=2441.43
lat (usec): min=45, max=52191, avg=1052.13, stdev=2441.68
clat percentiles (usec):
|  1.00th=[  118],  5.00th=[  188], 10.00th=[  265], 20.00th=[  392],
| 30.00th=[  506], 40.00th=[  635], 50.00th=[  783], 60.00th=[  922],
| 70.00th=[ 1074], 80.00th=[ 1254], 90.00th=[ 1680], 95.00th=[ 2311],
| 99.00th=[ 3949], 99.50th=[ 4948], 99.90th=[47973], 99.95th=[49546],
| 99.99th=[50070]
bw (  MiB/s): min= 2578, max= 2871, per=100.00%, avg=2697.33, stdev=16.88, samples=24
iops        : min=41246, max=45946, avg=43154.67, stdev=270.28, samples=24
write: IOPS=42.6k, BW=2662MiB/s (2792MB/s)(4100MiB/1540msec); 0 zone resets
slat (usec): min=2, max=3271, avg= 8.33, stdev=25.30
clat (usec): min=95, max=52303, avg=1920.68, stdev=2554.97
lat (usec): min=138, max=52312, avg=1929.12, stdev=2555.52
clat percentiles (usec):
|  1.00th=[  310],  5.00th=[  498], 10.00th=[  693], 20.00th=[  988],
| 30.00th=[ 1254], 40.00th=[ 1516], 50.00th=[ 1762], 60.00th=[ 1975],
| 70.00th=[ 2212], 80.00th=[ 2474], 90.00th=[ 2835], 95.00th=[ 3294],
| 99.00th=[ 4817], 99.50th=[ 5800], 99.90th=[50594], 99.95th=[50594],
| 99.99th=[50594]
bw (  MiB/s): min= 2560, max= 2861, per=100.00%, avg=2701.42, stdev=15.97, samples=24
iops        : min=40960, max=45780, avg=43219.67, stdev=255.59, samples=24
lat (usec)   : 50=0.01%, 100=0.26%, 250=4.39%, 500=12.56%, 750=12.72%
lat (usec)   : 1000=12.92%
lat (msec)   : 2=34.10%, 4=21.45%, 10=1.28%, 20=0.01%, 50=0.23%
lat (msec)   : 100=0.06%
cpu          : usr=2.91%, sys=9.45%, ctx=35300, majf=0, minf=295
IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=99.9%, 32=0.0%, >=64=0.0%
submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
issued rwts: total=65475,65597,0,0 short=0,0,0,0 dropped=0,0,0,0
latency   : target=0, window=0, percentile=100.00%, depth=16

Run status group 0 (all jobs):
READ: bw=2657MiB/s (2786MB/s), 2657MiB/s-2657MiB/s (2786MB/s-2786MB/s), io=4092MiB (4291MB), run=1540-1540msec
WRITE: bw=2662MiB/s (2792MB/s), 2662MiB/s-2662MiB/s (2792MB/s-2792MB/s), io=4100MiB (4299MB), run=1540-1540msec

Disk stats (read/write):
vda: ios=58387/58501, merge=35/82, ticks=56442/57649, in_queue=114196, util=49.76%

================== CPU tests ==================
Architecture:                         aarch64
CPU op-mode(s):                       64-bit
Byte Order:                           Little Endian
CPU(s):                               6
On-line CPU(s) list:                  0-5
Vendor ID:                            Apple
Model:                                0
Thread(s) per core:                   1
Core(s) per cluster:                  6
Socket(s):                            -
Cluster(s):                           1
Stepping:                             0x0
BogoMIPS:                             48.00
Flags:                                fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm jscvt fcma lrcpc dcpop sha3 asimddp sha512 asimdfhm dit uscat ilrcpc flagm sb paca pacg dcpodp flagm2 frint
Vulnerability Gather data sampling:   Not affected
Vulnerability Itlb multihit:          Not affected
Vulnerability L1tf:                   Not affected
Vulnerability Mds:                    Not affected
Vulnerability Meltdown:               Not affected
Vulnerability Mmio stale data:        Not affected
Vulnerability Reg file data sampling: Not affected
Vulnerability Retbleed:               Not affected
Vulnerability Spec rstack overflow:   Not affected
Vulnerability Spec store bypass:      Vulnerable
Vulnerability Spectre v1:             Mitigation; __user pointer sanitization
Vulnerability Spectre v2:             Not affected
Vulnerability Srbds:                  Not affected
Vulnerability Tsx async abort:        Not affected

================== PostgreSQL Tests ==================

================== Running connection test ==================
✓ Connection successful
PostgreSQL version: 17.5

================== Running latency test ==================
Query 1: 62.14ms
Query 2: 32.75ms
Query 3: 26.37ms
Query 4: 27.06ms
Query 5: 27.67ms

================== Running write performance test ==================
DROP TABLE
CREATE TABLE
Testing single row INSERT performance (1000 rows)...
Inserted 1000 rows in 50.45ms
Average: .05ms per insert
Testing bulk INSERT performance (10000 rows)...
k  Bulk inserted 10000 rows in 292.07ms
Throughput: 34238 rows/sec

================== Running read performance test ==================
Total rows: 10001
Count query took: 29.80ms
SELECT with condition (id < 1000): 30.32ms
Aggregate query (GROUP BY): 32.23ms

================== Running concurrent connection test ==================
Spawned 20 concurrent connections (all completed)

================== Running database info query ==================
Database size: 8531091 bytes
Active connections: 6
PostgreSQL uptime: 2026-05-21 17:37:54.672924+00

================== Running cleanup ==================
DROP TABLE

================== PostgreSQL tests completed ==================

================== Generating 10MB test file... ==================
1+0 records in
1+0 records out
10485760 bytes (10 MB, 10 MiB) copied, 0.0255081 s, 411 MB/s

================== Running S3 transfer test... ==================

================== Upload s3 testfile... ==================
100.00%  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  10.49 MB / 10.49 MB (491.69 kB/s) 22s (1/1)
Script started on 2026-05-21 19:02:22+00:00 [<not executed on terminal>]
100.00%  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  10.49 MB / 10.49 MB (491.69 kB/s) 22s (1/1)

Script done on 2026-05-21 19:02:44+00:00 [COMMAND_EXIT_CODE="0"]

================== Upload time: 22 seconds ==================

================== Download s3 testfile... ==================
100.00%  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  10.49 MB / 10.49 MB (7.48 MB/s) 1.6s (1/1)
Script started on 2026-05-21 19:02:44+00:00 [<not executed on terminal>]
100.00%  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  10.49 MB / 10.49 MB (7.48 MB/s) 1.6s (1/1)

Script done on 2026-05-21 19:02:45+00:00 [COMMAND_EXIT_CODE="0"]

================== Download time: 1 seconds ==================

================== Verifying file integrity... ==================

================== S3 test passed ==================
File size: 10485760 bytes
MD5 checksum: 29022c552b0f81a9c89f6ff676a5c102

================== Kafka test ==================

================== Creating Kafka Topic ==================

================== Starting Consumer ==================

================== Producing Messages ==================
Produce time: 1 seconds

================== Consumed Messages ==================
Successfully consumed 23 messages

================== All tests completed! ==================
```
</details>

