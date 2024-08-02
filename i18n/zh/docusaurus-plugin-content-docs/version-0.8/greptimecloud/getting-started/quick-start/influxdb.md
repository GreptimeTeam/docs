
import Includeinfluxdb from '../../../db-cloud-shared/quick-start/influxdb.md' 

<Includeinfluxdb/>

```shell
curl -L https://raw.githubusercontent.com/GreptimeCloudStarters/quick-start-influxdb-line-protocol/main/quick-start.sh | bash -s -- -e https://<host>/v1/influxdb/write -d <dbname> -u <username> -p <password>
```
