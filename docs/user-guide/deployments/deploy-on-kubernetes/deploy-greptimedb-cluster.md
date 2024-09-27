# Deploy GreptimeDB Cluster

This guide will walk you through deploying a GreptimeDB cluster on a Kubernetes environment. Make sure the [GreptimeDB Operator](./manage-greptimedb-operator/deploy-greptimedb-operator.md) is installed on your cluster before proceeding. We’ll cover everything from setting up an etcd cluster (optional) to configuring options and connecting to the database.

## Prerequisites
- [Helm](https://helm.sh/docs/intro/install/) (Use the Version appropriate for your Kubernetes API version)
- [GreptimeDB Operator](./manage-greptimedb-operator/deploy-greptimedb-operator.md) (Assumes the local host has a matching installation of the GreptimeDB Operator) 

## Create an etcd cluster

To install the ectd cluster, run the following `helm install` command. This command also creates a dedicated namespace `etcd-cluster` for the installation. 

```shell
helm install etcd oci://registry-1.docker.io/bitnamicharts/etcd \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  --create-namespace \
  -n etcd-cluster
```

### Verify the etcd cluster installation
Once installed, verify the status of the etcd cluster by listing the pods in the `etcd-cluster` namespace:

```bash
kubectl get pods -n etcd-cluster
```

You should see output similar to this:
```bash
NAME     READY   STATUS    RESTARTS     AGE
etcd-0   1/1     Running   0            80s
etcd-1   1/1     Running   0            80s
etcd-2   1/1     Running   0            80s
```

## Deploy a minimum GreptimeDB cluster

Next, deploy a minimum GreptimeDB cluster. The deployment will depend on an etcd cluster for coordination. If you already have one running, you can use its endpoint. If you followed the steps above, use `etcd.etcd-cluster.svc.cluster.local:2379` as the etcd endpoint.

Run this command to install the GreptimeDB cluster:
```shell
helm install greptimedb greptime/greptimedb-cluster \
  --set meta.etcdEndpoints=etcd.etcd-cluster.svc.cluster.local:2379 \
  --create-namespace \
  -n greptimedb-cluster
```

### Verify the GreptimeDB cluster installation
Check that all pods are running properly in the `greptimedb-cluster` namespace:

```bash
kubectl get pods -n greptimedb-cluster
```

You should see output similar to this:
```bash
NAME                                      READY   STATUS    RESTARTS   AGE
greptimedb-datanode-0                     1/1     Running   0          30s
greptimedb-datanode-2                     1/1     Running   0          30s
greptimedb-datanode-1                     1/1     Running   0          30s
greptimedb-frontend-7476dcf45f-tw7mx      1/1     Running   0          16s
greptimedb-meta-689cb867cd-cwsr5          1/1     Running   0          31s
```

## Advanced Configuration Options

### Use Object Storage as backend storage
To store data on Object Storage (here is example to store on Amazon S3), add the following configuration to your Helm command:

```bash
helm install greptimedb \
  --set meta.etcdEndpoints=etcd.etcd-cluster.svc.cluster.local:2379 \
  --set objectStorage.s3.bucket=<your-bucket> \
  --set objectStorage.s3.region=<region-of-bucket> \
  --set objectStorage.s3.root=<root-directory-of-data> \
  --set objectStorage.credentials.accessKeyId=<your-access-key-id> \
  --set objectStorage.credentials.secretAccessKey=<your-secret-access-key> \
  greptime/greptimedb-cluster \
  --create-namespace \
  -n greptimedb-cluster
```

### Using Remote WAL and enable the Region Failover
If you want to enable Remote WAL and region failover, follow this configuration. You’ll need a Kafka cluster running, and you can use its endpoint like `kafka.kafka-cluster.svc.cluster.local:9092`:

```bash
helm install greptimedb \
  --set meta.etcdEndpoints=etcd.etcd-cluster.svc.cluster.local:2379 \
  --set meta.enableRegionFailover=true \
  --set objectStorage.s3.bucket=<your-bucket> \
  --set objectStorage.s3.region=<region-of-bucket> \
  --set objectStorage.s3.root=<root-directory-of-data> \
  --set objectStorage.credentials.accessKeyId=<your-access-key-id> \
  --set objectStorage.credentials.secretAccessKey=<your-secret-access-key> \
  --set remoteWal.enable=true \
  --set remoteWal.kafka.brokerEndpoints[0]=kafka.kafka-cluster.svc.cluster.local:9092 \
  greptime/greptimedb-cluster \
  --create-namespace \
  -n greptimedb-cluster
```

### Static authentication
To enable static authentication for GreptimeDB cluster, you can configure user credentials during installation by specifying them with the auth settings. Here's an example of how to do this:

```bash
helm install greptimedb \
  --set meta.etcdEndpoints=etcd.etcd-cluster.svc.cluster.local:2379 \
  --set auth.enabled=true \
  --set auth.users[0].username=admin \
  --set auth.users[0].password=admin \
  greptime/greptimedb-cluster \
  --create-namespace \
  -n greptimedb-cluster
```

### Resource requests and limits
To control resource allocation (CPU and memory), modify the Helm installation command as follows:

```shell
helm install greptimedb \
  --set meta.etcdEndpoints=etcd.etcd-cluster.svc.cluster.local:2379 \
  --set meta.podTemplate.main.resources.requests.cpu=<cpu-resource> \
  --set meta.podTemplate.main.resources.requests.memory=<mem-resource> \
  --set datanode.podTemplate.main.resources.requests.cpu=<cpu-resource> \
  --set datanode.podTemplate.main.resources.requests.memory=<mem-resource> \
  --set frontend.podTemplate.main.resources.requests.cpu=<cpu-resource> \
  --set frontend.podTemplate.main.resources.requests.memory=<mem-resource> \
  greptime/greptimedb-cluster \
  --create-namespace \
  -n greptimedb-cluster
```

### Complex configurations with values.yaml

For more intricate configurations, first download the default `values.yaml` file and modify it locally.

```bash
curl -sLo values.yaml https://raw.githubusercontent.com/GreptimeTeam/helm-charts/main/charts/greptimedb-cluster/values.yaml
```

You can configure each component by specifying custom settings in the `configData` fields. For more details, refer to the [configuration](../configuration.md) documentation. 

Below is an example of how to modify the settings in the `values.yaml` file. This example demonstrates how to configure specific components within GreptimeDB. It sets the metasrv's selector type to `round_robin`, adjusts the datanode’s Mito engine by setting `global_write_buffer_size` to `4GB`, and configures the frontend's meta client `ddl_timeout` to `60s`:

```yaml
meta:
  configData: |-
    selector = "round_robin"
datanode:
  configData: |-    
    [[region_engine]]
    [region_engine.mito]
    global_write_buffer_size = "4GB"
frontend:
  configData: |-
    [meta_client]
    ddl_timeout = "60s"
```

Then, deploy using the modified values file:

```bash
helm install greptimedb greptime/greptimedb-cluster --values values.yaml
```

For a comprehensive list of configurable values via Helm,
please refer to the [configuration](../configuration.md), [value configuration](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-cluster/README.md#values).

## Connect to the cluster

After the installation is complete, use `kubectl port-forward` to expose the service ports so that you can connect to the cluster locally:


```shell
# You can use the MySQL or PostgreSQL client to connect the cluster, for example: 'mysql -h 127.0.0.1 -P 4002'.
# HTTP port: 4000
# gRPC port: 4001
# MySQL port: 4002
# PostgreSQL port: 4003
kubectl port-forward -n greptimedb-cluster svc/greptimedb-frontend 4000:4000 4001:4001 4002:4002 4003:4003 > connections.out &
```

Then you can use the MySQL client to [connect to the cluster](/user-guide/protocols/mysql.md#connect).
