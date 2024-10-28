# GreptimeDB Operator Management

## Prerequisites

- Kubernetes >= v1.18.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0

## Quick Start

:::warning
It's not recommended to use this method to install the GreptimeDB Operator in a production environment. 
:::

The fastest way to install the GreptimeDB Operator is to use `bundle.yaml`:

```bash
kubectl apply -f \
  https://github.com/GreptimeTeam/greptimedb-operator/releases/latest/download/bundle.yaml \
  --server-side
```

The greptimedb-operator will be installed in the `greptimedb-admin` namespace. When the `greptimedb-operator` is running, you can use the following command to verify the installation:

```bash
kubectl get pods -n greptimedb-admin
```

<details>
  <summary>Expected Output</summary>
```bash
NAME                                   READY   STATUS    RESTARTS   AGE
greptimedb-operator-7947d785b5-b668p   1/1     Running   0          2m18s
```
</details>

## Production Deployment

For production deployments, it's recommended to use Helm to install the GreptimeDB Operator.

### Installation

You can refer [Install the GreptimeDB Operator](/user-guide/deployments/deploy-on-kubernetes/getting-started.md#install-the-greptimedb-operator) for detailed instructions.

### Upgrade

We always publish the latest version of the GreptimeDB Operator as a Helm chart in our [official Helm repository](https://github.com/GreptimeTeam/helm-charts/tree/main).

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

:::note
The output may vary depending on the version of the charts.
:::


<details>
<summary>Expected Output</summary>
```bash
NAME                        	CHART VERSION	APP VERSION  	DESCRIPTION
greptime/greptimedb-operator	0.2.9        	0.1.3-alpha.1	The greptimedb-operator Helm chart for Kubernetes.
```
</details>

:::tip
If you want to list all the available versions, you can use the following command:

```
helm search repo greptime/greptimedb-operator --versions
```
:::

#### Upgrade the GreptimeDB Operator

You can upgrade to the latest released version of the GreptimeDB Operator by running the following command:

```bash
helm --namespace greptimedb-admin upgrade greptimedb-operator greptime/greptimedb-operator
```

:::note
The output may vary depending on the version of the charts.
:::

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
helm --namespace greptimedb-admin upgrade greptimedb-operator greptime/greptimedb-operator --version <version>
```

After the upgrade is complete, you can use the following command to verify the installation:

```bash
helm list -n greptimedb-admin
```

<details>
<summary>Expected Output</summary>
```bash
NAME               	NAMESPACE	REVISION	UPDATED                             	STATUS  	CHART                    	APP VERSION
greptimedb-operator	default  	2       	2024-10-28 19:30:52.62097 +0800 CST 	deployed	greptimedb-operator-0.2.9	0.1.3-alpha.1
```
</details>

### CRDs

There are two kind of CRD that are installed with the GreptimeDB Operator: `GreptimeDBCluster` and `GreptimeDBStandalone`.

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

By default, the GreptimeDB Operator chart will manage the installation and upgrade of the CRDs and the users don't need to manage them manually.

### Configuration

The GreptimeDB Operator chart provides a set of configuration options that allow you to customize the installation, you can refer to the [GreptimeDB Operator Helm Chart](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-operator/README.md) for more details.

You can create a `values.yaml` to configure the GreptimeDB Operator chart, for example:

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

replicas: 2

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
helm --namespace greptimedb-admin install greptimedb-operator greptime/greptimedb-operator -f values.yaml
```

If you want to upgrade the GreptimeDB Operator with the custom configuration, you can use the following command:

```bash
helm --namespace greptimedb-admin upgrade greptimedb-operator greptime/greptimedb-operator -f values.yaml
```

:::tip
You can use one command to install or upgrade the GreptimeDB Operator with the custom configuration:

```bash
helm --namespace greptimedb-admin upgrade --install \
  greptimedb-operator greptime/greptimedb-operator -f values.yaml
```
:::
