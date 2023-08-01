
To quickly get started with InfluxDB line protocol, we can use Bash to create some fake data and send it to GreptimeCloud.

1. Create a file named `quick-start.sh` with the following content:

```shell
#!/bin/bash
generate_data()
{
    # generate fake data
    host_1_cpu_util=$(shuf -i 40-60 -n 1)
    host_2_cpu_util=$(shuf -i 35-50 -n 1)
    host_1_mem_util=$(shuf -i 22-35 -n 1)
    host_2_mem_util=$(shuf -i 75-95 -n 1)
    # generate nanosecond timestamp
    now=$(($(date +%s)*1000000000))
    cat <<EOF
monitor,host=host1 cpu=$host_1_cpu_util,memory=$host_1_mem_util $now
monitor,host=host2 cpu=$host_2_cpu_util,memory=$host_2_mem_util $now
EOF
}

echo sending fake data to GreptimeCloud...

while true
do
    curl -i -XPOST "https://<host>/v1/influxdb/write?db=<dbname>&u=<username>&p=<password>" --data-binary "$(generate_data)"
    sleep 2
done
```

2. Allow the script to be executed:

```shell
chmod +x quick-start.sh
```

3. Run the script:

```shell
./quick-start.sh
```
