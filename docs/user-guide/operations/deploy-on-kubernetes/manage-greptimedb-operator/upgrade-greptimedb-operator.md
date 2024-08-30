# Upgrade GreptimeDB Operator
You can upgrade the GreptimeDB Operator at any time without impacting your managed GreptimeDB instances. This guide details the steps to upgrade an existing GreptimeDB Operator installation using Helm, specifically from version 0.2.1 to the lastest version.

### Verify the existing Operator installation.

First, verify the health and status of all Operator pods and services using:

```bash
kubectl get all -n greptimedb-operator
```

If the Operator was installed in a custom namespace, replace `greptimedb-operator` with your specific namespace using `-n <NAMESPACE>`.

Next, view the installed Helm charts in the namespace:

```bash
helm list -n greptimedb-operator
```

You should see output similar to this:
```
NAME               	NAMESPACE          	REVISION	UPDATED                                	STATUS  	CHART                    	APP VERSION
operator	        greptimedb-operator	1       	2024-08-30 08:04:53.388756424 +0000 UTC	deployed	greptimedb-operator-0.2.1	0.1.0-alpha.28
```

### Update the Operator Repository

Update the GreptimeDB Operator Helm repository to fetch the latest charts:

```bash
helm repo update greptimedb-operator
```

If you used a different alias when adding the repository, replace `greptimedb-operator` with that alias. You can review your Helm repositories with:

```bash
helm repo list
```

Check the latest available chart version:

```bash
helm search repo greptimedb-operator
```

You should see output similar to this:
```bash
NAME                        	CHART VERSION	APP VERSION   	DESCRIPTION
greptime/greptimedb-operator	0.2.3        	0.1.0-alpha.29	The greptimedb-operator Helm chart for Kubernetes.
```

### Upgrade the Operator version

Use Helm to upgrade the GreptimeDB Operator to the latest version:
```bash
helm upgrade -n greptimedb-operator \
operator greptime/greptimedb-operator
```

If the Operator is installed in a different namespace, specify it with the `-n` argument. Additionally, if you used a different installation name than operator, replace `operator` in the command.

The command should return a successful upgrade with an incremented `REVISION` value.

### Verify the Operator upgrade

To confirm the upgrade, run the following command:
```bash
kubectl get pod -l 'app.kubernetes.io/name=operator' -n greptimedb-operator -o json | jq '.items[0].spec.containers[0].image'
```