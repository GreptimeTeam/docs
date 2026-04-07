---
keywords: [cluster mode, Kubernetes, Docker Compose, deployment]
description: Instructions to deploy GreptimeDB in cluster mode using Kubernetes or Docker Compose, including steps for setup and cleanup.
---

# GreptimeDB Cluster

The GreptimeDB cluster can run in cluster mode to scale horizontally.

## Deploy the GreptimeDB cluster in Kubernetes

For production environments, we recommend deploying the GreptimeDB cluster in Kubernetes. Please refer to [Deploy on Kubernetes](/user-guide/deployments-administration/deploy-on-kubernetes/overview.md).

## Use Docker Compose

:::tip NOTE
Although Docker Compose is a convenient way to run the GreptimeDB cluster, it is only for development and testing purposes.

For production environments or benchmarking, we recommend using Kubernetes.
:::

###  Prerequisites

Using Docker Compose is the easiest way to run the GreptimeDB cluster. Before starting, make sure you have already installed the Docker.

### Step1: Download the YAML file for Docker Compose

```
wget https://raw.githubusercontent.com/GreptimeTeam/greptimedb/VAR::greptimedbVersion/docker/docker-compose/cluster-with-etcd.yaml
```

### Step2: Start the cluster

```
GREPTIMEDB_VERSION=VAR::greptimedbVersion \
  docker compose -f ./cluster-with-etcd.yaml up 
```

If the cluster starts successfully, it will listen on 4000-4003. , you can access the cluster by referencing the [Quick Start](../quick-start.md).

### Clean up

You can use the following command to stop the cluster:

```
docker compose -f ./cluster-with-etcd.yaml down
```

By default, the data will be stored in `./greptimedb-cluster-docker-compose`. You also can remove the data directory if you want to clean up the data.


## Next Steps

Learn how to write data to GreptimeDB in [Quick Start](../quick-start.md).
