---
keywords: [MySQL, system metrics, data visualization, GreptimeDB service, MySQL CLI]
description: Instructions on creating a service, writing data using MySQL, and visualizing data in GreptimeDB.
---

# MySQL

## Create Service
import Includecreateservice from './create-service.md' 

<Includecreateservice/>

## Write data

To quickly get started with MySQL, we can use Bash to collect system metrics, such as CPU and memory usage, and send it to GreptimeDB via MySQL CLI. The source code is available on [GitHub](https://github.com/GreptimeCloudStarters/quick-start-mysql).

```shell
curl -L https://raw.githubusercontent.com/GreptimeCloudStarters/quick-start-mysql/main/quick-start.sh | bash -s -- -h <host> -d <dbname> -u <username> -p <password>
```

## Visualize Data
import Includevisualizedata from './visualize-data.md' 

<Includevisualizedata/>
