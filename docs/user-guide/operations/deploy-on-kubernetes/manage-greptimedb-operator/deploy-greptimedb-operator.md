# Deploy GreptimeDB Operator

## Overview
The GreptimeDB Kubernetes Operator simplifies deploying GreptimeDB on both private and public cloud infrastructures. This guide walks you through installing the latest stable version of the GreptimeDB Operator on a Kubernetes cluster. The Operator leverages a [Custom Resource Definition (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/#customresourcedefinitions) to represent GreptimeDB as a Kubernetes [object](https://kubernetes.io/docs/concepts/overview/working-with-objects/).


## Prerequisites
- [Helm](https://helm.sh/docs/intro/install/) (Use the Version appropriate for your Kubernetes API version)

## Install the GreptimeDB Operator using Helm Charts

GreptimeDB provides a [Helm-compatible repository](https://github.com/GreptimeTeam/helm-charts) for easy deployment. Follow these steps to install the Operator using Helm:

### Add the GreptimeDB Operator repository
First, add the GreptimeDB Operator Helm repository:
```bash
helm repo add greptime https://greptimeteam.github.io/helm-charts/
```

Validate the repository by searching for the Operator chart:
```bash
helm search repo greptimedb-operator
```

You should see output similar to this:
```
NAME                        	CHART VERSION	APP VERSION   	DESCRIPTION
greptime/greptimedb-operator	0.2.3        	0.1.0-alpha.29	The greptimedb-operator Helm chart for Kubernetes.
```

### Install the Operator
To install the Operator, run the following `helm install` command. This command also creates a dedicated namespace `greptimedb-admin` for the installation. It's recommended to use a dedicated namespace for the Operator:
```bash
helm install \
  operator greptime/greptimedb-operator \
  --create-namespace \
  -n greptimedb-admin
```

### Verify the CRD installation
Check the contents of the `greptimedb-admin` namespace to confirm that all Custom Resource Definitions (CRDs) have been installed correctly:

```bash
kubectl get crds -n greptimedb-admin
```

You should see output similar to this:
```bash
NAME                                CREATED AT
greptimedbclusters.greptime.io      2024-09-09T07:54:07Z
greptimedbstandalones.greptime.io   2024-09-09T07:54:07Z
```

### Verify the Operator installation
After installation, check the contents of the `greptimedb-admin` namespace to confirm that all pods are running correctly:
```bash
kubectl get pods -n greptimedb-admin
```

You should see output similar to this:
```bash
NAME                                            READY   STATUS    RESTARTS   AGE
operator-greptimedb-operator-7d58cb8f7c-jz46g   1/1     Running   0          26s
```