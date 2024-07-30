---
template: quick-start-template.md
---

import DocTemplate from './quick-start-template.md'
import ShardInflux from '../../db-cloud-shared/quick-start/influxdb.md'

# InfluxDB Line Protocol

<DocTemplate>
<ShardInflux></ShardInflux>

  ```shell
  curl -L https://raw.githubusercontent.com/GreptimeCloudStarters/quick-start-influxdb-line-protocol/main/quick-start.sh | bash -s -- -e http://localhost:4000/v1/influxdb/write
  ```
</DocTemplate>
