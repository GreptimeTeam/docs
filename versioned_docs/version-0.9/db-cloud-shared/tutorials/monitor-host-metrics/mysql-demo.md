### Prerequisites

- [MySQL CLI](https://dev.mysql.com/downloads/shell/)

### Example Application

We will write a Bash script and showcase the core code to collect host metrics and send them to GreptimeDB. For reference, you can view the complete demo on [GitHub](https://github.com/GreptimeCloudStarters/quick-start-mysql).

To begin, create a new directory named `quick-start-mysql` to host our project. Then create a new file named `quick-start.sh` and make it executable:

```bash
touch quick-start.sh
chmod +x quick-start.sh
```

Write code to collect CPU and memory metrics and format the data into SQL format:

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

 cat <<EOF
    ("$unameOut",$user_cpu_util,$sys_cpu_util,$idle_cpu_util,$mem_util)
EOF
}
```

Then send the metrics to GreptimeDB every 5 seconds:

```bash
# Create table
mysql --ssl-mode=REQUIRED -u $username -p$password -h $host -P 4002 -A $database \
    -e "CREATE TABLE IF NOT EXISTS monitor (host STRING, user_cpu DOUBLE, sys_cpu DOUBLE, idle_cpu DOUBLE, memory DOUBLE, ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP, TIME INDEX(ts), PRIMARY KEY(host));"

# Insert metrics
echo Sending metrics to GreptimeCloud...
while true
do
 sleep 2
 mysql --ssl-mode=REQUIRED -u $username -p$password -h $host -P 4002 -A $database \
        -e "INSERT INTO monitor(host, user_cpu, sys_cpu, idle_cpu, memory) VALUES $(generate_data);"
done
```

For information on the host, database, username, and password required for the MySQL API, please refer to the MySQL documentation in [GreptimeDB](/user-guide/protocols/mysql.md) or [GreptimeCloud](/greptimecloud/integrations/mysql.md).

Congratulations on successfully completing the core section of the demo! You can now run the complete demo by following the instructions in the `README.md` file on the [GitHub repository](https://github.com/GreptimeCloudStarters/quick-start-mysql).
