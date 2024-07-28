 ### Create a dashboard

Create a new dashboard in Grafana by clicking the `Create your first dashboard` button.
Then click `Add visualization`, select `GreptimeDB` as the data source.

Select a metric from the `Metric` dropdown list, then click `Run queries` to view the metric data.
When you see the data and confirm it is correct, click `Save` to save the panel.

![grafana-create-panel-with-selecting-metric](/create-panel-with-selecting-metric-greptimedb.png)

You can also create a panel using PromQL.
Click the `code` button on the right side of the `Query` tab to switch to the PromQL editor.
Then enter a PromQL statement, such as `system_memory_usage{state="used"}`, click `Run query` to view the metric data.

![grafana-create-panel-with-promql](/grafana-create-panel-with-promql.png)


:::tip NOTE
GreptimeDB is compatible with most PromQL, but there are some limitations. Please refer to the [PromQL limitations](/user-guide/query-data/promql#limitations) document for more information.
:::