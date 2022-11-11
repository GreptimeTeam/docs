# GreptimeDB in Kubernetes

## What's GreptimeDB Operator

The GreptimeDB [Operator][1] manages GreptimeDB clusters on [Kubernetes][2] by using [Operator
pattern][3].

The GreptimeDB operator abstract the model of maintaining the high aviable GreptimeDB cluster, you
can create you own cluster as easy as possible:

```shell
cat <<EOF | kubectl apply -f -
apiVersion: greptime.io/v1alpha1kind: GreptimeDBClustermetadata:
  name: basicspec:
  base:
    main:
      image: greptime/greptimedbfrontend:
    replicas: 1meta:
    replicas: 1etcdEndpoints:
      - "etcd.default:2379"datanode:
    replicas: 3
```

## Get Started with GreptimeDB `Operator` on `Kubernetes`

### 1\. Create a test `Kubernetes` cluster

You can use [kind][4] to create your own test `Kubernetes` cluster:

``` shell
kind create cluster
```

### 2\. Use Helm to install GreptimeDB `Operator`

Make sure you already install [Helm][5].  Use the following commands to install
`greptimedb-operator` in default namespace:

```shell
helm repo add gt https://greptimeteam.github.io/helm-charts/
helm repo update
helm install gtcloud greptimedb-operator -n default
```

The maintained Helm charts is in [helm-charts][6].

### 3\. Create your own GreptimeDB cluster

```shell
helm install mydb greptimedb -n default
```

After the installation, you can use `kubectl port-forward` to access GreptimeDB cluster:

```shell
kubectl port-forward svc/mydb-frontend 3306:3306 > connections.out &
```

Use `mysql` to connect GreptimeDB:

```shell
mysql -h 127.0.0.1 -P 3306
```

[1]: <https://github.com/GreptimeTeam/greptimedb-operator>
[2]: <https://kubernetes.io/>
[3]: <https://kubernetes.io/docs/concepts/extend-kubernetes/operator/>
[4]: <https://kind.sigs.k8s.io/docs/user/quick-start/>
[5]: <https://helm.sh/docs/intro/install/>
[6]: <https://github.com/GreptimeTeam/helm-charts>
