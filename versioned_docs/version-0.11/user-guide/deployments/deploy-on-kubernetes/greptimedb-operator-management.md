---
keywords: [Kubernetes, GreptimeDB Operator, management, installation, upgrade, configuration, Helm]
description: Guide to managing the GreptimeDB Operator on Kubernetes, including installation, upgrade, configuration, and uninstallation using Helm.
---

# GreptimeDB Operator Management

The GreptimeDB Operator manages the [GreptimeDB](https://github.com/GrepTimeTeam/greptimedb) resources on [Kubernetes](https://kubernetes.io/) using the [Operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/). 

It is like an autopilot that automates the deployment, provisioning, and orchestration of the GreptimeDB cluster and standalone. 

The GreptimeDB Operator includes, but is not limited to, the following features:

- **Automated Provisioning**: Automates the deployment of the GreptimeDB cluster and standalone on Kubernetes by providing CRD `GreptimeDBCluster` and `GreptimeDBStandalone`.

- **Multi-Cloud Support**: Users can deploy the GreptimeDB on any Kubernetes cluster, including on-premises and cloud environments(like AWS, GCP, Aliyun, etc.).

- **Scaling**: Scale the GreptimeDB cluster as easily as changing the `replicas` field in the `GreptimeDBCluster` CR.

- **Monitoring Bootstrap**: Bootstrap the GreptimeDB monitoring stack for the GreptimeDB cluster by providing the `monitoring` field in the `GreptimeDBCluster` CR.

This document will show you how to install, upgrade, configure, and uninstall the GreptimeDB Operator on Kubernetes.

:::note
The following output may have minor differences depending on the versions of the Helm charts and environment.
:::

## Prerequisites

- Kubernetes >= v1.18.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0

## Production Deployment

For production deployments, it's recommended to use Helm to install the GreptimeDB Operator.

### Installation

You can refer [Install and verify the GreptimeDB Operator](/user-guide/deployments/deploy-on-kubernetes/getting-started.md#install-and-verify-the-greptimedb-operator) for detailed instructions.

:::note
If you are using [Argo CD](https://argo-cd.readthedocs.io/en/stable/) to deploy applications, please make sure that the `Application` has set the [`ServerSideApply=true`](https://argo-cd.readthedocs.io/en/latest/user-guide/sync-options/#server-side-apply) to enable the server-side apply (other GitOps tools may have similar settings).
:::

### Upgrade

We always publish the latest version of the GreptimeDB Operator as a Helm chart in our official Helm repository.

When the new version of the GreptimeDB Operator is released, you can upgrade the GreptimeDB Operator by running the following commands.

#### Update the Helm repository

```bash
helm repo update greptime
```

<details>
<summary>Expected Output</summary>
```bash
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "greptime" chart repository
Update Complete. ⎈Happy Helming!⎈
```
</details>

You can use the following command to search the latest version of the GreptimeDB Operator:

```bash
helm search repo greptime/greptimedb-operator
```

<details>
<summary>Expected Output</summary>
```bash
NAME                        	CHART VERSION	APP VERSION  	DESCRIPTION
greptime/greptimedb-operator	0.2.9        	0.1.3-alpha.1	The greptimedb-operator Helm chart for Kubernetes.
```
</details>

You also can use the following command to list all the available versions:

```bash
helm search repo greptime/greptimedb-operator --versions
```

#### Upgrade the GreptimeDB Operator

You can upgrade to the latest released version of the GreptimeDB Operator by running the following command:

```bash
helm -n greptimedb-admin upgrade greptimedb-operator greptime/greptimedb-operator
```

<details>
<summary>Expected Output</summary>
```bash
Release "greptimedb-operator" has been upgraded. Happy Helming!
NAME: greptimedb-operator
LAST DEPLOYED: Mon Oct 28 19:30:52 2024
NAMESPACE: greptimedb-admin
STATUS: deployed
REVISION: 2
TEST SUITE: None
NOTES:
***********************************************************************
 Welcome to use greptimedb-operator
 Chart version: 0.2.9
 GreptimeDB Operator version: 0.1.3-alpha.1
***********************************************************************

Installed components:
* greptimedb-operator

The greptimedb-operator is starting, use `kubectl get deployments greptimedb-operator -n greptimedb-admin` to check its status.
```
</details>

If you want to upgrade to a specific version, you can use the following command:

```bash
helm -n greptimedb-admin upgrade greptimedb-operator greptime/greptimedb-operator --version <version>
```

After the upgrade is complete, you can use the following command to verify the installation:

```bash
helm list -n greptimedb-admin
```

<details>
<summary>Expected Output</summary>
```bash
NAME                    NAMESPACE               REVISION        UPDATED                                 STATUS          CHART                           APP VERSION  
greptimedb-operator     greptimedb-admin        1               2024-10-30 17:46:45.570975 +0800 CST    deployed        greptimedb-operator-0.2.9       0.1.3-alpha.1
```
</details>

### CRDs

There are two kinds of CRD that are installed with the GreptimeDB Operator: `GreptimeDBCluster` and `GreptimeDBStandalone`.

You can use the following command to verify the installation:

```bash
kubectl get crd | grep greptime
```

<details>
  <summary>Expected Output</summary>
```bash
greptimedbclusters.greptime.io      2024-10-28T08:46:27Z
greptimedbstandalones.greptime.io   2024-10-28T08:46:27Z
```
</details>

By default, the GreptimeDB Operator chart will manage the installation and upgrade of the CRDs and the users don't need to manage them manually. If you want to know the specific definitions of these two types of CRD, you can refer to the GreptimeDB Operator [API documentation](https://github.com/GreptimeTeam/greptimedb-operator/blob/main/docs/api-references/docs.md).

### Configuration

The GreptimeDB Operator chart provides a set of configuration options that allow you to customize the installation, you can refer to the [GreptimeDB Operator Helm Chart](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-operator/README.md##values) for more details.

You can create a `values.yaml` to configure the GreptimeDB Operator chart (the complete configuration of `values.yaml` can be found in the [chart](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-operator/values.yaml)), for example:

```yaml
image:
  # -- The image registry
  registry: docker.io
  # -- The image repository
  repository: greptime/greptimedb-operator
  # -- The image pull policy for the controller
  imagePullPolicy: IfNotPresent
  # -- The image tag
  tag: latest
  # -- The image pull secrets
  pullSecrets: []

replicas: 1

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi
```

You can use the following command to install the GreptimeDB Operator with the custom configuration:

```bash
helm -n greptimedb-admin install greptimedb-operator greptime/greptimedb-operator -f values.yaml
```

If you want to upgrade the GreptimeDB Operator with the custom configuration, you can use the following command:

```bash
helm -n greptimedb-admin upgrade greptimedb-operator greptime/greptimedb-operator -f values.yaml
```

You also can use one command to install or upgrade the GreptimeDB Operator with the custom configuration:

```bash
helm -n greptimedb-admin upgrade --install greptimedb-operator greptime/greptimedb-operator -f values.yaml
```

### Uninstallation

You can use the `helm` command to uninstall the GreptimeDB Operator:

```bash
helm -n greptimedb-admin uninstall greptimedb-operator
```

We don't delete the CRDs by default when you uninstall the GreptimeDB Operator.

:::danger
If you really want to delete the CRDs, you can use the following command:

```bash
kubectl delete crd greptimedbclusters.greptime.io greptimedbstandalones.greptime.io
```

The related resources will be removed after you delete the CRDs.
:::
