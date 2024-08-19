# GreptimeDB Cluster

The GreptimeDB cluster can run in cluster mode to scale horizontally.

## Use Docker Compose

###  Prerequisites

Using Docker Compose is the easiest way to run the GreptimeDB cluster. Before starting, make sure you have already installed the Docker.

### Step1: Download the YAML file for Docker Compose

```
wget https://raw.githubusercontent.com/GreptimeTeam/greptimedb/v0.9.2/docker/docker-compose/cluster-with-etcd.yaml
```

### Step2: Start the cluster

```
GREPTIMEDB_VERSION=v0.9.2 \
  docker compose -f ./cluster-with-etcd.yaml up 
```

If the cluster starts successfully, it will listen on 4000-4003. , you can access the cluster by referencing the [Quick Start](../quick-start.md).

### Clean up

You can use the following command to stop the cluster:

```
docker compose -f ./cluster-with-etcd.yaml down
```

By default, the data will be stored in `/tmp/greptimedb-cluster-docker-compose`. You also can remove the data directory if you want to clean up the data.

## Deploy the GreptimeDB cluster in Kubernetes

Please refer to [Deploy on Kubernetes](/user-guide/operations/deploy-on-kubernetes/overview.md).

## Next Steps

Learn how to write data to GreptimeDB in [Quick Start](../quick-start.md).
