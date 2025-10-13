---
keywords: [Kubernetes deployment, GreptimeDB Enterprise, install GreptimeDB, start GreptimeDB, private docker registry, helm chart]
description: Steps to install GreptimeDB Enterprise on Kubernetes, including obtaining images and starting GreptimeDB.
---

# Deploy GreptimeDB Cluster

GreptimeDB Enterprise is released as docker images.
We provide each customer with a separate private docker registry hosted on Cloud,
which you can pull directly using the docker pull command or configure in helm charts.

## Get GreptimeDB Enterprise Image

You need to configure the image in the `values.yaml` file of the helm chart to obtain the dedicated GreptimeDB Enterprise,
for example:

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

In the above configuration,
the `registry`, `username` and `password` in `customImageRegistry` are used to create the k8s pull secret,
the `registry`, `repository` and `tag` in `image` are used to specify the GreptimeDB Enterprise image,
therefore `customImageRegistry.secretName` and `image.pullSecrets` must be consistent to ensure that the correct authentication information can be found when pulling the image.

Please contact Greptime staff to obtain the specific values for the above configuration items.
When Greptime staff first deliver GreptimeDB Enterprise to you,
they will inform you of the docker registry address, username and password via email.
Please keep them safe and do not share them with external personnel!

## Installation and Startup

Please refer to the [Deploy GreptimeDB Cluster on Kubernetes](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md) documentation.
