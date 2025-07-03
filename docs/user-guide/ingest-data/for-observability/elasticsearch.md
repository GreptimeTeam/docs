---
keywords: [Elasticsearch, log storage, API, configuration, data model, telegraf, logstash, filebeat]
description: Use Elasticsearch protocol to ingest log data.
---

# Elasticsearch

## Overview

GreptimeDB supports data ingestion through Elasticsearch's [`_bulk` API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html). We map Elasticsearch's Index concept to GreptimeDB's Table, and users can specify the database name using the `db` URL parameter. **Unlike native Elasticsearch, this API only supports data insertion, not modification or deletion**. At the implementation level, both `index` and `create` commands in native Elasticsearch `_bulk` API requests are treated as **creation operations** by GreptimeDB. Additionally, GreptimeDB only parses the `_index` field from native `_bulk` API command requests while ignoring other fields.

## HTTP API

In most log collectors(such as Logstash and Filebeat mentioned below), you only need to configure the HTTP endpoint like `http://${db_host}:${db_http_port}/v1/elasticsearch`, for example `http://localhost:4000/v1/elasticsearch`.

GreptimeDB supports data ingestion through Elasticsearch protocol by implementing the following two HTTP endpoints:

- **`/v1/elasticsearch/_bulk`**: Users can use the POST method to write data in NDJSON format to GreptimeDB.

  For example, the following request will create a table named `test` and insert two records:

  ```json
  POST /v1/elasticsearch/_bulk

  {"create": {"_index": "test", "_id": "1"}}
  {"name": "John", "age": 30}
  {"create": {"_index": "test", "_id": "2"}}
  {"name": "Jane", "age": 25}
  ```

- **`/v1/elasticsearch/${index}/_bulk`**: Users can use the POST method to write data in NDJSON format to the `${index}` table in GreptimeDB. If the POST request also contains an `_index` field, the `${index}` in the URL will be ignored.

  For example, the following request will create tables named `test` and `another_index`, and insert corresponding data:

  ```json
  POST /v1/elasticsearch/test/_bulk

  {"create": {"_id": "1"}}
  {"name": "John", "age": 30}
  {"create": {"_index": "another_index", "_id": "2"}}
  {"name": "Jane", "age": 25}
  ```

### HTTP Headers

- `x-greptime-db-name`: Specifies the database name. Defaults to `public` if not specified.
- `x-greptime-pipeline-name`: Specifies the pipeline name. Defaults to GreptimeDB's internal pipeline `greptime_identity` if not specified.
- `x-greptime-pipeline-version`: Specifies the pipeline version. Defaults to the latest version of the corresponding pipeline if not specified.

For more details about Pipeline, please refer to the [Manage Pipelines](/user-guide/logs/manage-pipelines.md) documentation.

### URL Parameters

You can use the following HTTP URL parameters:

- `db`: Specifies the database name. Defaults to `public` if not specified.
- `pipeline_name`: Specifies the pipeline name. Defaults to GreptimeDB's internal pipeline `greptime_identity` if not specified.
- `version`: Specifies the pipeline version. Defaults to the latest version of the corresponding pipeline if not specified.
- `msg_field`: Specifies the JSON field name containing the original log data. For example, in Logstash and Filebeat, this field is typically `message`. If specified, GreptimeDB will attempt to parse the data in this field as JSON format. If parsing fails, the field will be treated as a string. This configuration option currently only takes effect in URL parameters.

### Authentication Header

For detailed information about the authentication header, please refer to the [Authorization](/user-guide/protocols/http.md#authentication) documentation.

## Usage

### Use HTTP API to ingest data

You can create a `request.json` file with the following content:

```json
{"create": {"_index": "es_test", "_id": "1"}}
{"name": "John", "age": 30}
{"create": {"_index": "es_test", "_id": "2"}}
{"name": "Jane", "age": 25}
```

Then use the `curl` command to send this file as a request body to GreptimeDB:

```bash
curl -XPOST http://localhost:4000/v1/elasticsearch/_bulk \
  -H "Authorization: Basic {{authentication}}" \
  -H "Content-Type: application/json" -d @request.json
```

We can use a `mysql` client to connect to GreptimeDB and execute the following SQL to view the inserted data:

```sql
SELECT * FROM es_test;
```

We will see the following results:

```
mysql> SELECT * FROM es_test;
+------+------+----------------------------+
| age  | name | greptime_timestamp         |
+------+------+----------------------------+
|   30 | John | 2025-01-15 08:26:06.516665 |
|   25 | Jane | 2025-01-15 08:26:06.521510 |
+------+------+----------------------------+
2 rows in set (0.13 sec)
```

### Logstash

If you are using [Logstash](https://www.elastic.co/logstash) to collect logs, you can use the following configuration to write data to GreptimeDB:

```
output {
    elasticsearch {
        hosts => ["http://localhost:4000/v1/elasticsearch"]
        index => "my_index"
        parameters => {
           "pipeline_name" => "my_pipeline"
           "msg_field" => "message"
        }
    }
}
```

The `parameters` section is optional, while `hosts` and `index` should be adjusted according to your actual setup.

### Filebeat

If you are using [Filebeat](https://github.com/elastic/beats/tree/main/filebeat) to collect logs, you can use the following configuration to write data to GreptimeDB:

```
output.elasticsearch:
  hosts: ["http://localhost:4000/v1/elasticsearch"]
  index: "my_index"
  parameters:
    pipeline_name: my_pipeline
    msg_field: message
```

The `parameters` section is optional, while `hosts` and `index` should be adjusted according to your actual setup.

### Telegraf

If you are using [Telegraf](https://github.com/influxdata/telegraf) to collect logs, you can use its Elasticsearch plugin to write data to GreptimeDB, as shown below:

```toml
[[outputs.elasticsearch]]
  urls = [ "http://localhost:4000/v1/elasticsearch" ]
  index_name = "test_table"
  health_check_interval = "0s"
  enable_sniffer = false
  flush_interval = "1s"
  manage_template = false
  template_name = "telegraf"
  overwrite_template = false
  namepass = ["tail"]

 [outputs.elasticsearch.headers]
    "X-GREPTIME-DB-NAME" = "public"
    "X-GREPTIME-PIPELINE-NAME" = "greptime_identity"

[[inputs.tail]]
  files = ["/tmp/test.log"]
  from_beginning = true
  data_format = "value"
  data_type = "string"
  character_encoding = "utf-8"
  interval = "1s"
  pipe = false
  watch_method = "inotify"
```

Please adjust `urls`, `index_name`, and the corresponding `outputs.elasticsearch.header` according to your actual setup.
