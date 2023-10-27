# Metrics

使用prometheus采集GreptimeDB metrics

## Binary

通过以下命令下载GreptimeDB二进制:
```
curl -fsSL \
  https://raw.githubusercontent.com/greptimeteam/greptimedb/develop/scripts/install.sh | sh
```

运行 GreptimeDB:
```
./greptime standalone start
```

进入[官方文档](https://prometheus.io/download/) 下载prometheus二进制:
```
tar xvfz prometheus-*.tar.gz
cd prometheus-*
```

编写prometheus配置文件，并保存为prometheus.yml:
```
global:
  scrape_interval: 10s 

scrape_configs:
  - job_name: 'greptimedb'
    static_configs:
      - targets: ['localhost:4000']
```

运行prometheus:
```
./prometheus --config.file=prometheus.yml
```

在浏览器输入`localhost:9090`访问prometheus，完成对GreptimeDB的监控

## Docker

运行GreptimeDB:
```
docker run -p 4000-4003:4000-4003 \
  -p 4242:4242 -v "$(pwd)/greptimedb:/tmp/greptimedb" \
  --name greptime --rm \
  greptime/greptimedb standalone start \
  --http-addr 0.0.0.0:4000 \
  --rpc-addr 0.0.0.0:4001 \
  --mysql-addr 0.0.0.0:4002 \
  --postgres-addr 0.0.0.0:4003 \
  --opentsdb-addr 0.0.0.0:4242
```

编写prometheus配置文件，并保存为prometheus.yml:
```
global:
  scrape_interval: 10s

scrape_configs:
  - job_name: 'greptimedb'
    static_configs:
      - targets: ['host.docker.internal:4000']
```

运行prometheus:
```
docker run \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

## K8S

安装 [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) 
```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack
```

安装etcd
```
helm install etcd oci://registry-1.docker.io/bitnamicharts/etcd \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  -n default
```

安装GreptimeDB cluster
```
helm repo add greptime https://greptimeteam.github.io/helm-charts/
helm repo update
```
```
helm upgrade mycluster greptime/greptimedb-cluster -n default \
  --set prometheusMonitor.enabled=true \
  --set prometheusMonitor.path="/metrics" \
  --set prometheusMonitor.port="http" \
  --set prometheusMonitor.interval="30s" \
  --set prometheusMonitor.honorLabels="true" \
  --set prometheusMonitor.labelsSelector.release="prometheus"
```

## Metrics Detail

| Key                                        | Description                                            | Type    |
|--------------------------------------------|--------------------------------------------------------|---------|
| greptime_opendal_requests_total            |                                                        | counter |
| greptime_meta_create_catalog               |                                                        | counter |
| greptime_meta_create_schema                |                                                        | counter |
| greptime_opendal_bytes_total               |                                                        | counter |
| greptime_process_virtual_memory_max_bytes  | Maximum amount of virtual memory available in bytes.   | gauge   |
| greptime_catalog_schema_count              |                                                        | gauge   |
| greptime_catalog_catalog_count             |                                                        | gauge   |
| greptime_process_start_time_seconds        | Start time of the process since unix epoch in seconds. | gauge   |
| greptime_process_threads                   | Numberof OS threads in the process.                    | gauge   |
| greptime_process_cpu_seconds_total         | Total user and system CPU time spent in seconds.       | gauge   |
| greptime_process_virtual_memory_bytes      | Virtual memory size in bytes.                          | gauge   |
| greptime_sys_jemalloc_resident             |                                                        | gauge   |
| greptime_sys_jemalloc_allocated            |                                                        | gauge   |
| greptime_process_max_fds                   | Maximum number of open file descriptors.               | gauge   |
| greptime_app_version                       |                                                        | gauge   |
| greptime_runtime_threads_idle              |                                                        | gauge   |
| greptime_runtime_threads_alive             |                                                        | gauge   |
| greptime_process_resident_memory_bytes     | Resident memory size in bytes.                         | gauge   |
| greptime_process_open_fds                  | Number of open file descriptors.                       | gauge   |
| greptime_opendal_requests_duration_seconds |                                                        | summary |
| greptime_meta_create_catalog               |                                                        | summary |
| greptime_http_track_metrics                |                                                        | summary |
| greptime_meta_create_schema                |                                                        | summary |
