import DocTemplate from './../../db-cloud-shared/clients/grafana-integration.md' 
import Install from './grafana-includes/_install.md'
import PreviewDocker from './grafana-includes/_preview-docker.md'
import DataSourceImg from './grafana-includes/_datasource-img.md'
import CreateDashboard from './grafana-includes/_create-dashboard.md'

# Grafana
<DocTemplate
  dataSourcePluginIntro="
    The GreptimeDB data source plugin is based on the Prometheus data source and adds GreptimeDB-specific features.
The plugin adapts perfectly to the GreptimeDB data model,
thus providing a better user experience.
In addition, it also solves some compatibility issues compared to using the Prometheus data source directly."
  dataSourcePluginInstallation={<Install/>}
  previewDocker={<PreviewDocker></PreviewDocker>}
  dataSourceImg={<DataSourceImg></DataSourceImg>}
  connectionTitle="### Connection settings"
  connectionUrl="```txt
http://<host>:4000
```"
  createDashboard={<CreateDashboard></CreateDashboard>}
  serverUrl="```txt
http://<host>:4000/v1/prometheus
```"
  >
</DocTemplate>

