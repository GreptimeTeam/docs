
### Prerequisites

* [Python 3.10+](https://www.python.org)

### Example Application

Now we will create a quick start demo step by step to collect host metrics and send them to Greptime. The demo is based on [OTLP/HTTP](https://opentelemetry.io/). For reference, you can view the complete demo on [Github](https://github.com/GreptimeCloudStarters/quick-start-python).

To begin, create a new directory named `quick-start-python` to house our project and create a new file named `requirements.txt` in the directory and add the following:

```text
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

After the packages installed, create a new file named `main.py` and add the following:

```python
import time
import argparse
import base64
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import (
    ConsoleMetricExporter,
    PeriodicExportingMetricReader,
)
from opentelemetry import metrics
from opentelemetry.instrumentation.system_metrics import SystemMetricsInstrumentor
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter

def main():
    # Get command arguments
    parser = argparse.ArgumentParser(
                        prog='greptime-cloud-quick-start-python',
                        description='Quick start Python demo for greptime cloud')

    parser.add_argument('-host', required=True, help='The host address of the GreptimeCloud service')
    parser.add_argument('-db', '--database', required=True, help='The database of the GreptimeCloud service')
    parser.add_argument('-u', '--username', required=True, help='The username of the database')
    parser.add_argument('-p', '--password', required=True, help='The password of the database')
    args = parser.parse_args()
    host = args.host
    db = args.database
    username = args.username
    password = args.password

    auth = f"{username}:{password}"
    b64_auth = base64.b64encode(auth.encode()).decode("ascii")

    # Service name is required for most backends
    resource = Resource(attributes={
        SERVICE_NAME: "quick-start-python"
    })

    # GreptimeCloud service endpoint
    endpoint = f"https://{host}/v1/otlp/v1/metrics"
    exporter = OTLPMetricExporter(
        endpoint=endpoint,
        headers={"Authorization": f"Basic {b64_auth}", "x-greptime-db-name": db},
        timeout=5)

    # exporter = ConsoleMetricExporter()
    # export metrics every 2 seconds
    metric_reader = PeriodicExportingMetricReader(exporter, 2000)
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

    print("Sending metrics...")

    while True:
        time.sleep(2)

if __name__ == "__main__":
    main()
    
```

The `main()` function above parses command-line arguments, sets up authentication with Greptime, creates a `MeterProvider` object that uses a `PeriodicExportingMetricReader` object to export metrics every 2 seconds.
It then configures the `SystemMetricsInstrumentor` to collect system metrics.
Finally, the script enters an infinite loop where it sleeps for 2 seconds and then sends the collected metrics to Greptime using the `OTLPMetricExporter`.

For more details about the code, you can refer to the [OpenTelemetry Documentation](https://opentelemetry.io/docs/instrumentation/python/getting-started/).

Now we can run the application like this:

```shell
python main.py -host <host> -db <dbname> -u <username> -p <password>
```
