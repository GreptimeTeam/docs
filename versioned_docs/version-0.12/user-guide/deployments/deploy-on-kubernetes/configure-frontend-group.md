---
keywords: [Kubernetes, deployment, GreptimeDB, frontend group, CRD, installation, verification]
description: Step-by-step guide to deploying a GreptimeDB cluster with frontend groups on Kubernetes, including prerequisites, configuration, installation, and verification.
---

# Deploying a GreptimeDB Cluster with Frontend Groups

In this guide, you will learn how to deploy a GreptimeDB cluster on Kubernetes with a frontend group consisting of multiple frontend instances.

## Prerequisites

- [Docker](https://docs.docker.com/get-started/get-docker/) >= v23.0.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0
- [GreptimeDB Operator](https://github.com/GrepTimeTeam/greptimedb-operator)
- [ETCD](https://github.com/bitnami/charts/tree/main/bitnami/etcd)

## Download the CRD

First, you need to download the Custom Resource Definition (CRD) for GreptimeDB clusters:

```bash
curl -O https://raw.githubusercontent.com/GreptimeTeam/greptimedb-operator/13ca6992b7da2534c07053634d8c91fff00e7f05/config/crd/resources/greptime.io_greptimedbclusters.yaml
```

Apply the CRD to your Kubernetes cluster:

```bash
kubectl apply -f greptime.io_greptimedbclusters.yaml --server-side
```

## Upgrade operator

Install the GreptimeDB Operator, setting the image to `greptime/greptimedb-operator-dev:dev-20250227-1740669767-13ca6992`.


```bash
helm upgrade \
  --install \
  --create-namespace \
  greptimedb-operator greptime/greptimedb-operator \
  --set image.repository=greptime/greptimedb-operator-dev \
  --version 0.2.16 \
  --set image.tag=dev-20250227-1740669767-13ca6992 \
  --set crds.install=false \
  -n greptimedb-admin
```

## Frontend Group Configuration

When defining the frontend group, you must specify the name field for each frontend instance. Below is an example configuration that creates read and write frontend replicas:

```yaml
apiVersion: greptime.io/v1alpha1
kind: GreptimeDBCluster
metadata:
  name: cluster-with-frontend-group
  namespace: default
spec:
  initializer:
    image: greptime/greptimedb-initializer:v0.1.4-alpha.3
  base:
    main:
      image: greptime/greptimedb:v0.11.0
  frontendGroup:
  - name: read
    replicas: 1
    config: |
      default_timezone = "UTC"
      [http]
      timeout = "60s"
  - name: write
    replicas: 1
    config: |
      default_timezone = "UTC"
      [http]
      timeout = "60s"
  meta:
    replicas: 1
    etcdEndpoints:
      - "etcd.etcd-cluster.svc.cluster.local:2379"
  datanode:
    replicas: 1
```

## Validations

1. When setting the frontend group, the name must be set.
2. You cannot set both the frontend and the frontend group at the same time.

```yaml
# This is an illegal configuration !!!
apiVersion: greptime.io/v1alpha1
kind: GreptimeDBCluster
metadata:
  name: cluster-with-frontend-group
spec:
  frontendGroup:  #<=========Cannot set frontend and the frontend group at the same time=============>
  #  - name: read #<=========The name must be set=============>
    - replicas: 1 
  frontend:       #<========Cannot set frontend and the frontend group at the same time==============>
    replicas: 1
```    

## Verify the Installation

Check the status of the pods:

```bash
kubectl get pod
NAME                                                        READY  STATUS   RESTARTS AGE
cluster-with-frontend-group-datanode-0                      1/1    Running  0        2m
cluster-with-frontend-group-frontend-read-d474d4d97-llxmn   1/1    Running  0        2m
cluster-with-frontend-group-frontend-write-687d9bf56f-6425n 1/1    Running  0        2m
cluster-with-frontend-group-meta-679d7d796b-m75fr           1/1    Running  0        2m
```

To check the services:

```bash
 kubectl get svc
NAME                                       TYPE       CLUSTER-IP    EXTERNAL-IP  PORT(S)                              AGE
cluster-with-frontend-group-datanode       ClusterIP  None          <none>       4001/TCP,4000/TCP                    2m
cluster-with-frontend-group-frontend-read  ClusterIP  10.96.46.203  <none>       4001/TCP,4000/TCP,4002/TCP,4003/TCP  2m
cluster-with-frontend-group-frontend-write ClusterIP  10.96.93.169  <none>       4001/TCP,4000/TCP,4002/TCP,4003/TCP  2m
cluster-with-frontend-group-meta           ClusterIP  10.96.154.176 <none>       3002/TCP,4000/TCP                    2m
```

## Conclusion
You have successfully deployed a GreptimeDB cluster with a frontend group consisting of read and write instances. You can now proceed to explore the functionality of your GreptimeDB cluster or integrate it with additional tools as needed.
