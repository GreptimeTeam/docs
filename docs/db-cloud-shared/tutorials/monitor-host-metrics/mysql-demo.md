
### Prerequisites

* [MySQL CLI](https://dev.mysql.com/downloads/shell/)

### Example Application


We will write a Bash scripts to collect host metrics and send them to Greptime. For reference, you can view the complete demo on [Github](https://github.com/GreptimeCloudStarters/quick-start-mysql).

To begin, create a new directory named `quick-start-mysql` to house our project. Then create a new file named `quick-start.sh` and make it executable:

```bash
touch quick-start.sh
chmod +x quick-start.sh
```

Add the following to `quick-start.sh`:

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

# Get arguments
while getopts h:d:u:p: flag
do
	case "${flag}" in
		h) host=${OPTARG};;
		d) database=${OPTARG};;
		u) username=${OPTARG};;
		p) password=${OPTARG};;
	esac
done

if [ -z "$host" ]; then
	echo "-h Host is required"
	exit 1
fi

if [ -z "$database" ]; then
	echo "-d Database is required"
	exit 1
fi

if [ -z "$username" ]; then
	echo "-u Username is required"
	exit 1
fi

if [ -z "$password" ]; then
	echo "-p Password is required"
	exit 1
fi

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

The `generate_data()` function collects system metrics such as CPU usage and memory usage based on the operating system. It then formats the data into SQL format.

The script takes four command-line arguments to connect to GreptimeCloud. It creates a table named `monitor` if it doesn't exist and uses a while loop to continuously send the metrics to GreptimeCloud using MySQL CLI.

Now we can run the script to send metrics to GreptimeCloud:

```bash
bash quick-start.sh -h <host> -d <dbname> -u <username> -p <password>
```
