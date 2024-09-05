### Prerequisites

- [Python 3.10+](https://www.python.org)

### Example Application

In this section, we will create a quick start demo and showcase the core code to collect host metrics and send them to GreptimeDB. The demo is based on [OTLP/HTTP](https://opentelemetry.io/). For reference, you can obtain the entire demo on [GitHub](https://github.com/GreptimeCloudStarters/quick-start-python).

To begin, create a new directory named `quick-start-python` to house our project and create a new file named `requirements.txt` in the directory and add the following:

```txt
opentelemetry-api==1.19.0
opentelemetry-exporter-otlp-proto-common==1.19.0
opentelemetry-exporter-otlp-proto-http==1.19.0
opentelemetry-instrumentation==0.40b0
opentelemetry-instrumentation-system-metrics==0.40b0
opentelemetry-proto==1.19.0
opentelemetry-sdk==1.19.0
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Once the required packages are installed,create a new file named `main.py` and write the code to create a metric export object that sends metrics to GreptimeDB.
For the configuration about the exporter, please refer to OTLP integration documentation in [GreptimeDB](/user-guide/protocols/opentelemetry.md) or [GreptimeCloud](/greptimecloud/integrations/otlp.md).

```python
from opentelemetry import metrics
from opentelemetry.instrumentation.system_metrics import SystemMetricsInstrumentor
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter

auth = f"{username}:{password}"
b64_auth = base64.b64encode(auth.encode()).decode("ascii")
endpoint = f"https://{host}/v1/otlp/v1/metrics"
exporter = OTLPMetricExporter(
    endpoint=endpoint,
    headers={"Authorization": f"Basic {b64_auth}", "x-greptime-db-name": db},
    timeout=5)
```

Then attach the exporter to the MetricReader and start the host metrics collection:

```python
metric_reader = PeriodicExportingMetricReader(exporter, 5000)
provider = MeterProvider(resource=resource, metric_readers=[metric_reader])

# Sets the global default meter provider
metrics.set_meter_provider(provider)
configuration = {
    "system.memory.usage": ["used", "free", "cached"],
    "system.cpu.time": ["idle", "user", "system", "irq"],
    "process.runtime.memory": ["rss", "vms"],
    "process.runtime.cpu.time": ["user", "system"],
}
SystemMetricsInstrumentor(config=configuration).instrument()

```

For more details about the code, you can refer to the [OpenTelemetry Documentation](https://opentelemetry.io/docs/instrumentation/python/getting-started/).

Congratulations on successfully completing the core section of the demo! You can now run the complete demo by following the instructions in the `README.md` file on the [GitHub repository](https://github.com/GreptimeCloudStarters/quick-start-python).
