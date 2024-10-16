# Upgrade GreptimeDB Operator
You can upgrade the GreptimeDB Operator at any time without impacting your managed GreptimeDB instances. This guide details the steps to upgrade an existing GreptimeDB Operator installation using Helm, specifically from version 0.2.1 to the latest version.

### Verify the existing Operator installation.

First, verify the health and status of all Operator pods using:

```bash
kubectl get pods -n greptimedb-admin
```

If the Operator was installed in a custom namespace, replace `greptimedb-admin` with your specific namespace using `-n <NAMESPACE>`.

Next, view the installed Helm charts in the namespace:

```bash
helm list -n greptimedb-admin
```

You should see output similar to this:
```
NAME               	NAMESPACE          	REVISION	UPDATED                                	STATUS  	CHART                    	APP VERSION
operator	        greptimedb-admin    1       	2024-08-30 08:04:53.388756424 +0000 UTC	deployed	greptimedb-operator-0.2.1	0.1.0-alpha.28
```

The Operator is currently installed with version `0.1.0-alpha.28` using the `greptimedb-operator-0.2.1` chart.

### Update the Operator repository

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
helm upgrade -n greptimedb-admin \
  operator greptime/greptimedb-operator
```

If the Operator is installed in a different namespace, specify it with the `-n` argument. Additionally, if you used a different installation name than operator, replace `operator` in the command.

The command should return a successful upgrade with an incremented `REVISION` value.

### Verify the Operator upgrade

To confirm the upgrade, run the following command:
```bash
kubectl get pod -l 'app.kubernetes.io/name=operator' -n greptimedb-admin -o json | jq '.items[0].spec.containers[0].image'
```

You should see the following output, indicating that the Operator has been successfully upgraded to the latest version:
```bash
"docker.io/greptime/greptimedb-operator:v0.1.0-alpha.29"
```