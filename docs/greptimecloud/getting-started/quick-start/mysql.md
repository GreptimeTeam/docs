
To quickly get started with MySQL, we can use Bash to collect system metrics, such as CPU and memory usage, and send it to GreptimeCloud via MySQL CLI.

```shell
curl -L https://github.com/GreptimeCloudStarters/quick-start-mysql/releases/download/v1.0.0/quick-start.sh --output quick-start.sh && chmod +x quick-start.sh && ./quick-start.sh -h <host> -d <dbname> -u <username> -p <password>
```

The source code is avaliable at [Github](https://github.com/GreptimeCloudStarters/quick-start-mysql).
