### 准备

- [Python 3.10+](https://www.python.org)

### 示例 Demo

在本节中，我们将创建一个快速开始的 Demo，并展示收集 host 指标并发送到 GreptimeDB 的核心代码。该 Demo 基于[OTLP/HTTP](https://opentelemetry.io/)。你可以在 [GitHub](https://github.com/GreptimeCloudStarters/quick-start-python) 上获取整个 Demo 以作参考。

首先，创建一个名为 `quick-start-python` 的新目录来托管我们的项目，然后创建文件 `requirements.txt` 并添加以下内容：

```txt
opentelemetry-api==1.19.0
opentelemetry-exporter-otlp-proto-common==1.19.0
opentelemetry-exporter-otlp-proto-http==1.19.0
opentelemetry-instrumentation==0.40b0
opentelemetry-instrumentation-system-metrics==0.40b0
opentelemetry-proto==1.19.0
opentelemetry-sdk==1.19.0
```

安装依赖：

```bash
pip install -r requirements.txt
```

安装所需的包后，创建名为 `main.py` 的新文件并编写代码创建一个 metric exporter 对象，将 metrics 发送到 GreptimeDB。
请参考 [GreptimeDB](/user-guide/protocols/opentelemetry.md) 或 [GreptimeCloud](/greptimecloud/integrations/otlp.md) 中的 OTLP 集成文档获取 exporter 的相关配置。

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

将 exporter 附加到 MeterProvider 并开始收集 host metrics：

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

请参考 [OpenTelemetry 文档](https://opentelemetry.io/docs/instrumentation/python/getting-started/) 获取有关代码的更多详细信息。

恭喜你完成了 Demo 的核心部分！现在可以按照 [GitHub 库](https://github.com/GreptimeCloudStarters/quick-start-python)中 `README.md` 文件中的说明运行完整的 Demo。
