我们将编写一个 Bash 脚本，并展示收集 host metrics 并将其发送到 GreptimeDB 的核心代码。您可以在 [GitHub](https://github.com/GreptimeCloudStarters/quick-start-influxdb-line-protocol) 上查看完整的 Demo。

首先，创建一个名为 `quick-start-influxdb` 的新目录来托管我们的项目，然后创建一个名为 `quick-start.sh` 的新文件并使其可执行：

```bash
touch quick-start.sh
chmod +x quick-start.sh
```

在脚本中收集 CPU 和内存指标，并将数据格式化为 InfluxDB line protocol 格式：

```bash
#!/bin/bash

generate_data()
{
 unameOut="$(uname -s)"
 case "${unameOut}" in
  Linux*)
   user_cpu_util=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')
   sys_cpu_util=$(top -bn1 | grep "Cpu(s)" | awk '{print $6}')
   idle_cpu_util=$(top -bn1 | grep "Cpu(s)" | awk -F "," '{print $4}' | awk -F " " '{print $1}')
   mem_util=$(free | grep Mem | awk '{print $3}')
   ;;
  Darwin*)
   user_cpu_util=$(top -l 1 | awk '/^CPU usage: / { print substr($3, 1, length($3)-1) }')
   sys_cpu_util=$(top -l 1 | awk '/^CPU usage: / { print substr($5, 1, length($5)-1) }')
   idle_cpu_util=$(top -l 1 | awk '/^CPU usage: / { print substr($7, 1, length($7)-1) }')
   mem_util=$(top -l 1 | awk '/^PhysMem:/ { print substr($6, 1, length($6)-1) }')
   ;;
  *)
   user_cpu_util=$(shuf -i 10-15 -n 1)
   sys_cpu_util=$(shuf -i 5-10 -n 1)
   idle_cpu_util=$(shuf -i 70-80 -n 1)
   mem_util=$(shuf -i 50-60 -n 1)
 esac
 now=$(($(date +%s)*1000000000))
 cat <<EOF
monitor,host=$unameOut user_cpu=$user_cpu_util,sys_cpu=$sys_cpu_util,idle_cpu=$idle_cpu_util,memory=$mem_util $now
EOF
}
```

每隔 5 秒发送数据到 GreptimeDB：

```sh
echo Sending metrics to GreptimeCloud...
while true
do
 sleep 2
 curl -i -XPOST "https://$host/v1/influxdb/write?db=$database&u=$username&p=$password" --data-binary "$(generate_data)"
done
```

请参阅 [GreptimeDB](/user-guide/protocols/influxdb-line-protocol.md) 或 [GreptimeCloud](/greptimecloud/integrations/influxdb.md) 中的 InfluxDB 文档以获取 InfluxDB API 中的 `host`、`database`、`username` 和 `password` 信息，

恭喜你完成了 Demo 的核心部分！现在可以按照 [GitHub 库](https://github.com/GreptimeCloudStarters/quick-start-influxdb-line-protocol)中 `README.md` 文件中的说明运行完整的 Demo。
