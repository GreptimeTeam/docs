## Installation

```python
pip install greptimeai
```

## Setup

Before get started, add the following to your environment variables:

```shell
export GREPTIMEAI_HOST='<host>'
export GREPTIMEAI_DATABASE='<dbname>'
export GREPTIMEAI_TOKEN='<username>:<password>'
```

## How-To

If you have OpenAI account, you can observe your LLM applications like this:

```python
from greptimeai.langchain.callback import GreptimeCallbackHandler
from langchain.chains import LLMChain
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate

callbacks = [GreptimeCallbackHandler()]

llm = OpenAI()
prompt = PromptTemplate.from_template("1 + {number} = ")
chain = LLMChain(llm=llm, prompt=prompt)
chain.run(number=2, callbacks=callbacks)
```

You can find more details in [example](https://github.com/GreptimeTeam/greptimeai/blob/main/examples/langchain.ipynb)
and [cookbook](https://github.com/GreptimeTeam/greptimeai-cookbook/tree/main/examples/langchain)
