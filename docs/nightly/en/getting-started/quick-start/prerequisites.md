
Before trying GreptimeDB, we need to have GreptimeDB and Grafana installed and running locally.

* [GreptimeDB](https://greptime.com/) is used for storing and querying data.
* [Grafana](https://grafana.com/) is used for visualizing data.

Here we use [Docker Compose](https://docs.docker.com/compose/) to start GreptimeDB and Grafana. To do this, create a `docker-compose.yml` file with the following content:

```yaml
services:
  grafana:
    image: grafana/grafana-oss:<%grafana-version%>
    container_name: grafana
    ports:
      - 127.0.0.1:3000:3000

  greptime:
    image: greptime/greptimedb:<%greptimedb-version%>
    container_name: greptimedb
    ports:
      - 127.0.0.1:4000:4000
      - 127.0.0.1:4001:4001
      - 127.0.0.1:4002:4002
      - 127.0.0.1:4003:4003
    command: "standalone start --http-addr 0.0.0.0:4000 --rpc-addr 0.0.0.0:4001 --mysql-addr 0.0.0.0:4002 --postgres-addr 0.0.0.0:4003"
    volumes:
      - ./greptimedb:/tmp/greptimedb

networks: {}
```

Then run the following command:

```shell
docker-compose up
```

:::tip NOTE
The following steps assume that you have followed the documentation above, which uses Docker Compose to install GreptimeDB and Grafana.
:::

Once you've successfully started GreptimeDB,
you can verify the database status using the following command:

```shell
curl http://127.0.0.1:4000/status
```

If the database is running, you will see an output like the following:

```json
{
  "source_time": "2024-05-30T07:59:52Z",
  "commit": "05751084e7bbfc5e646df7f51bb7c3e5cbf16d58",
  "branch": "HEAD",
  "rustc_version": "rustc 1.79.0-nightly (f9b161492 2024-04-19)",
  "hostname": "977898bbda4f",
  "version": "0.8.1"
}
```
