## Installation

```python
pip install greptimeai
```

## Setup

```shell
export GREPTIMEAI_HOST='<host>'
export GREPTIMEAI_DATABASE='<dbname>'
export GREPTIMEAI_TOKEN='<username>:<password>'
```

## How-To

```python
from greptimeai.langchain.callback import GreptimeCallbackHandler

greptime_callback = GreptimeCallbackHandler()
```

You can find more details in [example](https://github.com/GreptimeTeam/greptimeai/blob/main/examples/langchain.ipynb)
and [cookbook](https://github.com/GreptimeTeam/greptimeai-cookbook/tree/main/examples/langchain)
