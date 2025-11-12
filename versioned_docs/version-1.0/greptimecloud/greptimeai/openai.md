## Installation

```python
pip install greptimeai
```

## Setup

Before get started, export the following to your environment variables:

```shell
export GREPTIMEAI_HOST='<host>'
export GREPTIMEAI_DATABASE='<dbname>'
export GREPTIMEAI_TOKEN='<username>:<password>'
```

## How-To

```shell
export OPENAI_API_KEY='sk-xxx'
```

```python
from greptimeai import openai_patcher
from openai import OpenAI

client = OpenAI()
openai_patcher.setup(client=client)  # This is the only line you need to add

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Say this is a test",
        }
    ],
    model="gpt-3.5-turbo",
    user="user_123",
)
```

You can find more details in [example](https://github.com/GreptimeTeam/greptimeai/blob/main/examples/openai.ipynb)
and [cookbook](https://github.com/GreptimeTeam/greptimeai-cookbook/tree/main/examples/openai)
