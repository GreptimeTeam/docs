
To quickly get started with MySQL, we can use Bash to collect system metrics, such as CPU and memory usage, and send it to GreptimeDB via MySQL CLI. The source code is avaliable on [GitHub](https://github.com/GreptimeCloudStarters/quick-start-mysql).

```shell
curl -L https://raw.githubusercontent.com/GreptimeCloudStarters/quick-start-mysql/main/quick-start.sh | bash -s -- -h <host> -d <dbname> -u <username> -p <password>
```
