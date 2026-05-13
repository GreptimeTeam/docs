---
keywords: [Kubernetes deployment, GreptimeDB Enterprise, install GreptimeDB, start GreptimeDB, private docker registry, helm chart]
description: Steps to install GreptimeDB Enterprise on Kubernetes, including obtaining images and starting GreptimeDB.
---

# GreptimeDB Enterprise Deployment Guide

## Environment Requirements

- [Docker](https://docs.docker.com/get-started/get-docker/) >= v23.0.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.21.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0
- [kubernetes](https://kubernetes.io/) >= 1.21

## Overview

The GreptimeDB Enterprise Edition deployment includes the following components:
1. GreptimeDB Operator: Used to interact with the Kubernetes cluster.
2. KV Store: Used to store database metadata (supports cloud services or self-hosted). It is recommended to use RDS from cloud services such as AWS RDS PostgreSQL. Optional storage facilities include:
- PostgreSQL
- MySQL
- ETCD

3. GreptimeDB Database Cluster, including the following components:
- Meta：Database cluster metadata management component
- Datanode：Data node
- Frontend：Entry point and protocol parsing node
- Flownode(optional): Stream computing node
- Vector Sidecar：Metrics collection agent
- GreptimeDB Standalone: Cluster self-monitoring storage node

4. GreptimeDB Enterprise Dashboard
5. Kafka(optional): Provides Remote WAL for GreptimeDB
6. MinIO(optional): Provides object storage for GreptimeDB. It is recommended to use object storage from cloud services (e.g., AWS S3)

Components marked with * are optional:

| Pod Component Name               | Replicas | CPU (Core) | Memory (GB) | Disk (Gi) |
|----------------------------------|----------|------------|-------------|-----------|
| ETCD`*`                          | 3        | 2          | 4           | 10        |
| GreptimeDB Operator              | 1        | 1          | 1           |           |
| Meta                             |          |            |             |           |
| Datanode                         |          |            |             |           |
| Frontend                         |          |            |             |           |
| Flownode`*`                      |          |            |             |           |
| Vector Sidecar                   |          |            |             |           |
| GreptimeDB Standalone            | 1        | 4          | 8           |           |
| GreptimeDB Enterprise Dashboard  | 1        |            |             |           |
| Kafka`*`                         | 3        |            |             |           |
| MinIO`*`                         | 4        |            |             |           |

## Deploy GreptimeDB Operator

Refer to [GreptimeDB Operator Management Documentation](/user-guide/deployments-administration/deploy-on-kubernetes/greptimedb-operator-management.md) for detailed installation steps.

## Deploy ETCD

Refer to [Manage ETCD](/user-guide/deployments-administration/manage-metadata/manage-etcd.md) for detailed installation steps.

## Deploy Kafka

Refer to [Deploy Kafka Cluster](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-kafka.md) for detailed installation steps.

## Deploy MinIO

Refer to [Deploy MinIO Cluster](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-minio.md) for detailed installation steps.

## Install and Start GreptimeDB

### Obtain GreptimeDB Enterprise Edition Image

GreptimeDB Enterprise Edition is distributed as a Docker image. We provide each customer with a dedicated private Docker repository hosted on Alibaba Cloud. You can pull it directly using the docker pull command or configure it in the Helm chart.

You need to configure the image information in the Helm chart's `values.yaml` file to obtain your dedicated GreptimeDB Enterprise Edition, for example:

```yaml
customImageRegistry:
  enabled: true
  # -- pull secret name, customizable, must match `image.pullSecrets`
  secretName: greptimedb-custom-image-pull-secret
  registry: <registry>
  username: <username>
  password: <password>

image:
  registry: <registry>
  repository: <repository>
  tag: <tag>
  pullSecrets:
    - greptimedb-custom-image-pull-secret
```

In the above configuration:
- `registry`, `username`, and `password` under `customImageRegistry` are used to create the Kubernetes pull secret
- `registry`, `repository`, and `tag` under `image` are used to specify the GreptimeDB Enterprise Edition image
- Therefore, `customImageRegistry.secretName` and `image.pullSecrets` must match to ensure correct authentication when pulling the image

Please contact Greptime staff to obtain the specific values for the above configuration items.
When Greptime staff first deliver the GreptimeDB Enterprise Edition to you, they will inform you of the image registry address, username, and password via email or other means. Please keep this information safe and do not share it with external parties!

### Configuration Management

Before installation, you need to create a file to configure the GreptimeDB cluster. Adjust it according to your Kubernetes environment. For more configurations, please refer to the [documentation](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md). Below is a reference configuration for `greptimedb-cluster-values.yaml`:

```yaml
customImageRegistry:
  enabled: true
  # -- pull secret name, customizable, must match `image.pullSecrets`
  secretName: greptimedb-custom-image-pull-secret
  registry: <registry>
  username: <username>
  password: <password>

image:
  registry: <registry>
  repository: <repository>
  tag: <tag>
  pullSecrets:
    - greptimedb-custom-image-pull-secret

additionalLabels: {}

initializer:
  registry: greptime-registry.cn-hangzhou.cr.aliyuncs.com
  repository: greptime/greptimedb-initializer
  tag: "VAR::greptimedbOperatorVersion"

# -- Meta configuration
meta:
  # -- Meta replicas
  replicas: 3
  
  backendStorage:
    # Optional
    # KV storage configuration, this configuration connects to ETCD
    etcd:
      endpoints: ["etcd.etcd-cluster.svc.cluster.local:2379"]
    # Below is an example using PostgreSQL as the KV store:
    # postgresql:
    #   host: "postgres.default.svc.cluster.local"
    #   port: 5432
    #   database: "metasrv"
    #   table: "greptime_metakv"
    #   electionLockID: 1
    #   credentials:
    #     secretName: "meta-postgresql-credentials"
    #     username: "root"
    #     password: "root"

  podTemplate:
    main:
      # Meta resource configuration
      resources:
        requests:
          cpu: '2'
          memory: 4Gi
        limits:
          cpu: '2'
          memory: 4Gi
    affinity:
      podAntiAffinity:
        preferredDuringSchedulingIgnoredDuringExecution:
          - podAffinityTerm:
              labelSelector:
                matchLabels:
                  app.greptime.io/component: greptimedb-meta
              topologyKey: kubernetes.io/hostname
            weight: 1

# -- Datanode configuration
datanode:
  # -- Datanode replicas
  replicas: 3
  
  # -- Datanode configuration
  configData: |-
    [[region_engine]]
    [region_engine.mito]
    write_cache_size = "20G"
    write_cache_ttl = "7d"

  podTemplate:
    main:
      # -- Datanode resource
      resources:
        requests:
          cpu: '8'
          memory: 16Gi
        limits:
          cpu: '8'
          memory: 16Gi
    affinity:
      podAntiAffinity:
        preferredDuringSchedulingIgnoredDuringExecution:
          - podAffinityTerm:
              labelSelector:
                matchLabels:
                  app.greptime.io/component: greptimedb-datanode
              topologyKey: kubernetes.io/hostname
            weight: 1      
  # -- Datanode local disk configuration
  storage:
    storageClassName: null
    # -- Local disk size
    storageSize: 100Gi
    # -- Storage retain policy for datanode persistent volume
    storageRetainPolicy: Retain

# -- Frontend configuration
frontend:
  # -- Frontend replicas
  replicas: 3    
  
  podTemplate:
    main:
      # Frontend resource
      resources:
        requests:
          cpu: '8'
          memory: 16Gi
        limits:
          cpu: '8'
          memory: 16Gi
    affinity:
      podAntiAffinity:
        preferredDuringSchedulingIgnoredDuringExecution:
          - podAffinityTerm:
              labelSelector:
                matchLabels:
                  app.greptime.io/component: greptimedb-frontend
              topologyKey: kubernetes.io/hostname
            weight: 1   

# -- Flownode configuration
flownode:
  # -- Whether to deploy flownode
  enabled: false
  # -- Flownode replicas
  replicas: 1
  
  podTemplate:
    main:
      resources:
        requests:
          cpu: '8'
          memory: 16Gi
        limits:
          cpu: '8'
          memory: 16Gi  

# -- Database self-monitoring configuration
monitoring:
  # -- Enable self-monitoring
  enabled: true
  standalone:
    base:
      imagePullSecrets: 
        - name: "greptimedb-custom-image-pull-secret"
      main:
        # Self-monitoring resource configuration
        resources:
          requests:
            cpu: '4'
            memory: 8Gi
          limits:
            cpu: '4'
            memory: 8Gi
    # Self-monitoring standalone storage location, can be optionally configured for object storage
    # objectStorage:
    #   s3:
    #     secretName: "greptimedb-object-storage-secret"
    #     bucket: "greptimedb-bucket"
    #     region: "ap-southeast-1"
    #     root: "greptimedb-monitor-data"  
    #     endpoint: "http://minio.minio:9000"
    # Self-monitoring local disk size
    datanodeStorage:
      fs:
        storageClassName: null
        storageSize: 100Gi
  # sidecar vector configuration
  vector:
    registry: greptime-registry.cn-hangzhou.cr.aliyuncs.com
    repository: timberio/vector
    tag: 0.46.1-debian   
    # sidecar vector resource configuration
    resources:
      requests:
        cpu: '1'
        memory: 1Gi
      limits:
        cpu: '1'
        memory: "1Gi" 
               
# Object storage related configuration, enable as needed
# Using MinIO
# objectStorage:
#   existingSecretName: "greptimedb-object-storage-secret"
#   cache:
#     cacheCapacity: "50GiB"
#   s3:
#     bucket: "greptimedb-bucket"
#     region: "ap-southeast-1"
#     root: "greptimedb-data"  
#     endpoint: "http://minio.minio:9000"

# Enable Enterprise Edition user and permission configuration
auth:
  enabled: true
  useBuiltIn: true
  mountPath: "/etc/greptimedb/auth"
  fileName: "passwd"
  users:
    # Default admin username, modify as needed
    - username: "superuser"
      # Initial admin account password, modify as needed
      password: "1fa44bbc-5ded-42bd-a3f1-c3621affce63"
      permission: "admin"       

# Remote WAL related configuration, enable as needed
# remoteWal:
#   enabled: true
#   kafka:
#     brokerEndpoints:
#       - "kafka-broker-0.kafka-broker-headless.kafka.svc.cluster.local:9092"
#       - "kafka-broker-1.kafka-broker-headless.kafka.svc.cluster.local:9092"
#       - "kafka-broker-2.kafka-broker-headless.kafka.svc.cluster.local:9092"
```

### Start GreptimeDB

Install the GreptimeDB cluster in the `greptimedb` namespace:

```bash
helm upgrade --install greptimedb \
  --create-namespace \
  oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-cluster \
  -n greptimedb --values greptimedb-cluster-values.yaml
```

Verify the GreptimeDB installation:

```bash
kubectl get pod -n greptimedb
```

<details>
  <summary>Expected output</summary>
```bash
NAME                                   READY   STATUS    RESTARTS   AGE
greptimedb-datanode-0                  2/2     Running   0          2m33s
greptimedb-datanode-1                  2/2     Running   0          2m33s
greptimedb-datanode-2                  2/2     Running   0          2m33s
greptimedb-frontend-74999c79cc-pzj8w   2/2     Running   0          17s
greptimedb-frontend-74999c79cc-rm2fb   2/2     Running   0          17s
greptimedb-frontend-74999c79cc-zbtdg   2/2     Running   0          17s
greptimedb-meta-56dc894867-jpt5c       2/2     Running   0          4m29s
greptimedb-meta-56dc894867-tpw4c       2/2     Running   0          4m29s
greptimedb-meta-56dc894867-wmh1t       2/2     Running   0          4m29s
greptimedb-monitor-standalone-0        1/1     Running   0          4m42s
```
</details>

## Deploy Enterprise Dashboard

### Configuration Management

Before installation, you need to create a file `dashboard-values.yaml` to configure the dashboard. Below is a configuration example:

```yaml
replicaCount: 1

image:
  # Please contact Greptime staff for the value
  repository: <repository>
  tag: <tag>
  pullPolicy: IfNotPresent

imagePullSecrets:
  - name: greptimedb-custom-image-pull-secret

nameOverride: ""
fullnameOverride: ""

config: |
  servicePort: 19095
  logLevel: info
  enableLicenseManager: true
  enableUserAuthentication: true
  backendStore:
    type: sqlite
    sqlite:
      dataDir: /data
  provisionedInstances:
    - name: greptimedb
      namespace: greptimedb
      type: cluster
      settings:
        basic:
          url: http://greptimedb-frontend.greptimedb.svc.cluster.local:4000
          meta_url: http://greptimedb-meta.greptimedb.svc.cluster.local:4000
        monitoring:
          greptimedb:
            url: http://greptimedb-monitor-standalone.greptimedb.svc.cluster.local:4000
        license:
          secret_name: greptimedb-license
          secret_namespace: greptimedb

servicePort: 19095

serviceAccount:
  create: true
  annotations: {}
  name: ""

podAnnotations: {}

podSecurityContext: {}
  # fsGroup: 2000

securityContext: {}

service:
  type: ClusterIP
  port: 19095
  annotations: {}

resources:
  requests:
    cpu: '1'
    memory: 1Gi
  limits:
    cpu: '1'
    memory: 1Gi

nodeSelector: {}
tolerations: []
affinity: {}
```

### Start Enterprise Dashboard

```bash
helm upgrade --install greptimedb-enterprise-dashboard \
  oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-enterprise-dashboard \
  -n greptimedb \
  --values dashboard-values.yaml
```

Verify the Enterprise Dashboard installation:

```bash
kubectl get pod -n greptimedb | grep enterprise-dashboard
```

<details>
  <summary>Expected output</summary>
```bash
greptimedb-enterprise-dashboard-67f498d6f9-n89z5   1/1   Running   0   27s
```
</details>

```bash
kubectl get svc -n greptimedb | grep enterprise-dashboard
```

<details>
  <summary>Expected output</summary>
```bash
greptimedb-enterprise-dashboard   ClusterIP   10.96.80.175   <none>   19095/TCP    89s
```
</details>

### Log in to Enterprise Dashboard

Access port 19095 of the dashboard service to log in.

![Enterprise Dashboard Login](/enterprise-dashboard-login.png)

Log in using the superuser account and password from the database deployment. You will see:

1. Query: Use SQL to query data
2. Logs Query: Use the UI to query log tables
3. Cluster Overview: Current cluster statistics
4. Metrics Monitoring: Database cluster self-monitoring metrics
5. Instance Logs: Database instance logs
6. User Management: Add, delete, and modify user accounts

![Enterprise Dashboard Page](/enterprise-dashboard-login.png)
