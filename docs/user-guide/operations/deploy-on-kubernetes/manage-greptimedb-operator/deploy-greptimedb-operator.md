# Deploy GreptimeDB Operator

## Overview
The GreptimeDB Kubernetes Operator simplifies deploying GreptimeDB on both private and public cloud infrastructures. This guide walks you through installing the latest stable version of the GreptimeDB Operator on a Kubernetes cluster. The Operator leverages a [Custom Resource Definition (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/#customresourcedefinitions) to represent GreptimeDB as a Kubernetes [object](https://kubernetes.io/docs/concepts/overview/working-with-objects/).


## Prerequisites
- [Helm](https://helm.sh/docs/intro/install/) (Use the Version appropriate for your Kubernetes API version)

## Install the GreptimeDB Operator using Helm Charts

GreptimeDB provides a Helm-compatible repository for easy deployment. Follow these steps to install the Operator using Helm:

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
To install the Operator, run the following `helm install` command. This command also creates a dedicated namespace `greptimedb-operator` for the installation. It's recommended to use a dedicated namespace for the Operator:
```bash
helm install \
  operator greptime/greptimedb-operator \
  --create-namespace \
  -n greptimedb-operator
```

### Verify the Operator installation
After installation, check the contents of the `greptimedb-operator` namespace to confirm that all pods and services are running correctly:
```bash
kubectl get all -n greptimedb-operator
```

You should see output similar to this:
```bash
NAME                                       READY   STATUS    RESTARTS   AGE
pod/operator-8495fcb545-jpz2m              1/1     Running   0          17s

NAME                                  READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/operator              1/1     1            1           17s

NAME                                             DESIRED   CURRENT   READY   AGE
replicaset.apps/operator-8495fcb545              1         1         1       17s
```