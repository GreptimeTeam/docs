# Monitor GreptimeDB

To collect GreptimeDB metrics using prometheus

## Start GreptimeDB and Prometheus
### Binary

Install GreptimeDB according to the [documentation](https://docs.greptime.com/getting-started/try-out-greptimedb#binary)

[The official documentation for prometheus](https://prometheus.io/download/) download the binary, and execute the following command:
```
tar xvfz prometheus-*.tar.gz
cd prometheus-*
```

Write a Prometheus configuration file and save it as prometheus.yml:
```
global:
  scrape_interval: 15s 

scrape_configs:
  - job_name: 'greptimedb'
    static_configs:
      - targets: ['localhost:4000']
```

Run prometheus:
```
./prometheus --config.file=prometheus.yml
```

Access Prometheus by entering `localhost:9090` in your web browser.


### Docker

Install GreptimeDB according to the [documentation](https://docs.greptime.com/getting-started/try-out-greptimedb#docker)

Write a Prometheus configuration file and save it as prometheus.yml:
```
global:
  scrape_interval: 15s 

scrape_configs:
  - job_name: 'greptimedb'
    static_configs:
      - targets: ['host.docker.internal:4000']
```

Run prometheus:
```
docker run \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

### Kubernetes

Install [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)
```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack
```

Install etcd
```
helm install etcd oci://registry-1.docker.io/bitnamicharts/etcd \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  -n default
```

Install GreptimeDB cluster
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
