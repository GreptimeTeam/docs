---
keywords: [Kubernetes, deployment, GreptimeDB, frontend groups, CRD, installation, verification]
description: Step-by-step guide to deploying a GreptimeDB cluster with frontend groups on Kubernetes, including prerequisites, configuration, installation, and verification.
---

# Deploying a GreptimeDB Cluster with Frontend Groups

In this guide, you will learn how to deploy a GreptimeDB cluster on Kubernetes with a frontend group consisting of multiple frontend instances.

## Prerequisites

- [Docker](https://docs.docker.com/get-started/get-docker/) >= v23.0.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0
- [GreptimeDB Operator](https://github.com/GrepTimeTeam/greptimedb-operator) >= v0.3.0
- [ETCD](https://github.com/bitnami/charts/tree/main/bitnami/etcd)

## Upgrade operator

Install the GreptimeDB Operator, setting the image version to be greater than or equal to `v0.3.0`.

```bash
helm repo update
```

```bash
helm upgrade \
  --install \
  --create-namespace \
  greptimedb-operator greptime/greptimedb-operator \
  -n greptimedb-admin
```

## Frontend Groups Configuration

When defining the frontend groups, you must specify the name field for each frontend instance. Below is an example configuration that creates read and write frontend replicas:

```yaml
apiVersion: greptime.io/v1alpha1
kind: GreptimeDBCluster
metadata:
  name: greptimedb
  namespace: default
spec:
  initializer:
    image: greptime/greptimedb-initializer:latest
  base:
    main:
      image: greptime/greptimedb:latest  
  frontendGroups:
  - name: read
    replicas: 2
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

## Validity

When setting the frontend groups, the name must be set.

```yaml
# This is an illegal configuration !!!
apiVersion: greptime.io/v1alpha1
kind: GreptimeDBCluster
metadata:
  name: greptimedb
spec:
  frontendGroups: 
  #  - name: read #<=========The name must be set=============>
    - replicas: 1
```    

## Verify the Installation

Check the status of the pods:

```bash
kubectl get pods -n default
NAME                                        READY   STATUS    RESTARTS   AGE
greptimedb-datanode-0                       1/1     Running   0          27s
greptimedb-frontend-read-66bf68bd5c-8kg8g   1/1     Running   0          21s
greptimedb-frontend-read-66bf68bd5c-x752l   1/1     Running   0          21s
greptimedb-frontend-write-bdd944b97-pkf9d   1/1     Running   0          21s
greptimedb-meta-699f74cd9d-42w2c            1/1     Running   0          87s
```

To check the services:

```bash
kubectl get service -n default
NAME                        TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                               AGE
greptimedb-datanode         ClusterIP   None            <none>        4001/TCP,4000/TCP                     102s
greptimedb-frontend-read    ClusterIP   10.96.174.200   <none>        4001/TCP,4000/TCP,4002/TCP,4003/TCP   42s
greptimedb-frontend-write   ClusterIP   10.96.223.1     <none>        4001/TCP,4000/TCP,4002/TCP,4003/TCP   42s
greptimedb-meta             ClusterIP   10.96.195.163   <none>        3002/TCP,4000/TCP                     3m4s
```

## Conclusion

You have successfully deployed a GreptimeDB cluster with a frontend group consisting of read and write instances. You can now proceed to explore the functionality of your GreptimeDB cluster or integrate it with additional tools as needed.
