---
keywords: [Kubernetes 部署, GreptimeDB 企业版, 安装 GreptimeDB, 启动 GreptimeDB, 私有 docker 仓库, helm chart]
description: 在 Kubernetes 上安装 GreptimeDB 企业版的步骤，包括获取镜像、安装 GreptimeDB Operator 和 etcd 集群、配置 values.yaml 和启动 GreptimeDB。
---

# GreptimeDB 企业版部署指南

## 环境准备

- [Docker](https://docs.docker.com/get-started/get-docker/) >= v23.0.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.21.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0
- [kubernetes](https://kubernetes.io/) >= 1.21

## 前言

GreptimeDB 企业版部署包括以下组件：
1. GreptimeDB Operator：用于和 Kubernetes 集群交互。
2. KV 存储：用于存储数据库元数据信息（支持云服务或自建），推荐使用云服务中的 RDS，例如 AWS RDS PostgreSQL。可选以下存储设施： 
- PostgreSQL
- MySQL
- ETCD

3. GreptimeDB 数据库集群，包含以下组件：
- Meta：数据库集群元数据信息管理组件
- Datanode：数据节点
- Frontend：入口和协议解析节点
- Flownode(可选): 流计算节点
- Vector Sidecar：指标采集 agent
- GreptimeDB Standalone: 集群自监控存储节点

4. GreptimeDB Enterprise Dashboard
5. Kafka(可选): 为 GreptimeDB 提供 Remote WAL
6. MinIO(可选): 为 GreptimeDB 提供对象存储，推荐使用云服务中的对象存储(例如：AWS S3)

其中打`*`的为可选安装:

| Pod 组件名称                        | 副本数量 | CPU (单位: Core) | 内存 (单位: GB) | 磁盘 (单位: Gi) |
|---------------------------------|------|----------------|-------------|-------------|
| ETCD`*`                         | 3    | 2              | 4           | 10          |
| GreptimeDB Operator             | 1    | 1              | 1           |             |
| Meta                            |      |                |             |             |
| Datanode                        |      |                |             |             |
| Frontend                        |      |                |             |             |
| Flownode`*`                     |      |                |             |             |
| Vector Sidecar                  |      |                |             |             |
| GreptimeDB Standalone           | 1    | 4              | 8           |             |
| GreptimeDB Enterprise Dashboard | 1    |                |             |             |
| Kafka`*`                        | 3    |                |             |             |
| MinIO`*`                        | 4    |                |             |             |

## 部署 GreptimeDB Operator

参考 [GreptimeDB Operator 的管理文档](/user-guide/deployments-administration/deploy-on-kubernetes/greptimedb-operator-management.md)获取详细的安装步骤。

## 部署 ETCD

参考 [管理 ETCD](/user-guide/deployments-administration/manage-metadata/manage-etcd.md)获取详细的安装步骤。

## 部署 Kafka

参考 [部署 Kafka 集群](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-kafka.md)获取详细的安装步骤。

## 部署 MinIO

参考 [部署 MinIO 集群](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-kafka.md)获取详细的安装步骤。

## 安装及启动 GreptimeDB

### 获取 GreptimeDB 企业版镜像

GreptimeDB 企业版以 docker 镜像发布。我们为每位客户提供了一个单独的、托管在阿里云上的私有 docker 仓库，你可以使用 docker pull 命令直接拉取，或在 helm chart 中配置。

你需要在 helm chart 的 `values.yaml` 文件中配置镜像信息以获得专属的 GreptimeDB 企业版，例如：

```yaml
customImageRegistry:
  enabled: true
  # -- pull secret 名称，可自定义，需要和 `image.pullSecrets` 保持一致
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

上述配置中，
`customImageRegistry` 中的 `registry`、`username` 和 `password` 用于创建 k8s 的 pull secret，
`image` 中的 `registry`、`repository` 和 `tag` 用于指定 GreptimeDB 企业版镜像，
因此 `customImageRegistry.secretName` 和 `image.pullSecrets` 需要保持一致以保证拉取镜像时能够找到正确的认证信息。

请联系 Greptime 工作人员获取上述配置项的具体值。
Greptime 工作人员在首次交付给你 GreptimeDB 企业版时，会通过邮件或其他方式告知你镜像仓库地址和用户名密码。请妥善保存，并切勿分享给外部人员！

### 配置管理

在安装之前，你需要创建一个文件来配置 GreptimeDB 集群。请根据你的 Kubernetes 环境调整，更多配置请参考[文档](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md)。以下是 `greptimedb-cluster-values.yaml` 的参考配置：

```yaml
customImageRegistry:
  enabled: true
  # -- pull secret 名称，可自定义，需要和 `image.pullSecrets` 保持一致
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

# -- Meta 配置
meta:
  # -- Meta 副本数
  replicas: 3
  
  backendStorage:
    # 可选
    # KV 存储配置，本配置连接到 ETCD
    etcd:
      endpoints: ["etcd.etcd-cluster.svc.cluster.local:2379"]
    # 以下是一个使用 PostgreSQL 作为 KV 存储的示例
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
      # Meta 资源配置
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

# -- Datanode 配置
datanode:
  # -- Datanode 副本数量
  replicas: 3
  
  # -- Datanode 配置
  configData: |-
    [[region_engine]]
    [region_engine.mito]
    write_cache_size = "20G"
    write_cache_ttl = "7d"

  podTemplate:
    main:
      # -- Datanode 资源设置
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
  # -- Datanode 本地磁盘配置
  storage:
    storageClassName: null
    # -- 本地磁盘大小
    storageSize: 100Gi
    # -- Storage retain policy for datanode persistent volume
    storageRetainPolicy: Retain

# -- Frontend 配置
frontend:
  # -- Frontend 副本数
  replicas: 3    
  
  podTemplate:
    main:
      # Frontend 资源配置
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

# -- Flownode 配置
flownode:
  # -- 是否部署 flownode
  enabled: false
  # -- Flownode 副本数
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

# -- 数据库自监控配置
monitoring:
  # -- 打开自监控
  enabled: true
  standalone:
    base:
      imagePullSecrets: 
        - name: "greptimedb-custom-image-pull-secret"
      main:
        # 自监控资源配置
        resources:
          requests:
            cpu: '4'
            memory: 8Gi
          limits:
            cpu: '4'
            memory: 8Gi
    # 自监控 standalone 存储位置，可按需打开存放至对象存储
    # objectStorage:
    #   s3:
    #     secretName: "greptimedb-object-storage-secret"
    #     bucket: "greptimedb-bucket"
    #     region: "ap-southeast-1"
    #     root: "greptimedb-monitor-data"  
    #     endpoint: "http://minio.minio:9000"
    # 自监控本地磁盘大小
    datanodeStorage:
      fs:
        storageClassName: null
        storageSize: 100Gi
  # sidecar vector 配置
  vector:
    registry: greptime-registry.cn-hangzhou.cr.aliyuncs.com
    repository: timberio/vector
    tag: 0.46.1-debian   
    # sidecar vector 资源配置
    resources:
      requests:
        cpu: '1'
        memory: 1Gi
      limits:
        cpu: '1'
        memory: "1Gi" 
               
# 对象存储相关配置，按需打开
# 使用 MinIO
# objectStorage:
#   existingSecretName: "greptimedb-object-storage-secret"
#   cache:
#     cacheCapacity: "50GiB"
#   s3:
#     bucket: "greptimedb-bucket"
#     region: "ap-southeast-1"
#     root: "greptimedb-data"  
#     endpoint: "http://minio.minio:9000"

# 打开企业版用户和权限配置
auth:
  enabled: true
  useBuiltIn: true
  mountPath: "/etc/greptimedb/auth"
  fileName: "passwd"
  users:
    # 默认的 admin 用户名，按需修改
    - username: "superuser"
      # 初始化 admin 账户的密码，按需修改
      password: "1fa44bbc-5ded-42bd-a3f1-c3621affce63"
      permission: "admin"       

# Remote WAL相关配置，按需打开
# remoteWal:
#   enabled: true
#   kafka:
#     brokerEndpoints:
#       - "kafka-broker-0.kafka-broker-headless.tsdb.svc.cluster.local:9092"
#       - "kafka-broker-1.kafka-broker-headless.tsdb.svc.cluster.local:9092"
#       - "kafka-broker-2.kafka-broker-headless.tsdb.svc.cluster.local:9092"
```

### 启动 GreptimeDB

在 `greptimedb` 命名空间中安装 GreptimeDB 集群：
```bash
helm upgrade --install greptimedb \
  --create-namespace \
  oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-cluster \
  -n greptimedb --values greptimedb-cluster-values.yaml
```

验证 GreptimeDB 安装:

```bash
kubectl get pod -n greptimedb
```

<details>
  <summary>预期输出</summary>
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

## 部署 Enterprise Dashboard

### 配置管理

在安装之前，你需要创建一个文件 `dashboard-values.yaml` 来配置 dashboard，以下是配置示例:

```yaml
replicaCount: 1

image:
  # 请咨询 Greptime 工作人员获取
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

# dashboard 资源配置
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

### 启动 Enterprise Dashboard

```bash
helm upgrade --install greptimedb-enterprise-dashboard \
  oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-enterprise-dashboard \
  -n greptimedb \
  --values dashboard-values.yaml
```

验证 Enterprise Dashboard 安装:

```bash
kubectl get pod -n greptimedb | grep enterprise-dashboard
```

<details>
  <summary>预期输出</summary>
```bash
greptimedb-enterprise-dashboard-67f498d6f9-n89z5   1/1   Running   0   27s
```
</details>

```bash
kubectl get svc -n greptimedb | grep enterprise-dashboard
```

<details>
  <summary>预期输出</summary>
```bash
greptimedb-enterprise-dashboard   ClusterIP   10.96.80.175   <none>   19095/TCP    89s
```
</details>

### 登录 Enterprise Dashboard

访问 dashboard service 的 19095 端口进行登录

![Enterprise Dashboard Login](/enterprise-dashboard-login.png)

使用数据库部署中的 superuser 账号密码进行登录，可见:
1. 查询：使用 SQL 查询数据
2. Logs 查询：使用 UI 查询 log 表
3. 集群概览：当前集群统计信息
4. 指标监控：数据库集群的自身监控指标
5. 实例日志：数据库自身的日志
6. 用户管理：增删改用户账号

![Enterprise Dashboard Page](/enterprise-dashboard-login.png)
