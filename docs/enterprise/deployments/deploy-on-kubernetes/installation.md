---
keywords: [Kubernetes deployment, GreptimeDB Enterprise, install GreptimeDB, start GreptimeDB, private docker registry, helm chart]
description: Steps to install GreptimeDB Enterprise on Kubernetes, including obtaining images and starting GreptimeDB.
---

# Deploy GreptimeDB Cluster

GreptimeDB Enterprise is released as docker images.
We provide each customer with a separate private docker registry hosted on Cloud,
which you can pull directly using the docker pull command or configure in helm charts.

## Get GreptimeDB Enterprise

Upon receiving GreptimeDB Enterprise,
you will be provided with the docker registry address, username, and password via email.
Please store this information securely!

Each release of GreptimeDB Enterprise has a unique `tag` identifier.
With this `tag`, plus the registry address `registry`, username `username`, and password `password` provided by our staff,
you can pull the GreptimeDB Enterprise image:

- Login to docker registry: `docker login --username=<username> --password=<password> <registry>`
- Pull docker image: `docker pull <registry>:<tag>`

Then configure GreptimeDB Enterprise in the helm chart:

First, create a pull secret for the image registry in k8s
(for detailed methods and instructions, please refer to the [k8s official documentation](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/)).

```bash
kubectl create secret docker-registry regcred --docker-server=<registry> --docker-username=<username> --docker-password=<password>
```

For example:

![k8s_pull_secret](/k8s-pull-secret.jpg)

Then add this secret to the helm chart's `values.yaml`:

```yaml
image:
  registry: <registry>
  repository: <repository>
  tag: <tag>
  pullSecrets: [ regcred ]
```

Where `<repository>` is the part after `:` in `<registry>`; `<tag>` is the unique identifier for the GreptimeDB Enterprise image.

## Installation and Startup

Please refer to the [Deploy GreptimeDB Cluster on Kubernetes](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md) documentation.
