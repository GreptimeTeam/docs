# 入门指南

## 安装

### 创建 Python 环境

如果您正在使用 Greptime 的 Docker 镜像，那么它已经设置好了脚本功能，您可以跳过这一步。

如果您希望使用带有 pyo3 功能的 Greptime 二进制文件，首先需要知道您的 Greptime 二进制文件所需的 Python 版本。您可以通过运行 `ldd greptime | grep 'libpython'`（或在 Mac 上运行 `otool -L greptime|grep Python.framework`）来检查。然后安装相应的 Python 版本（例如，`libpython3.10.so` 需要 Python 3.10）。

使用 Conda 创建一个 Python3 环境。Conda 是管理 Python 环境的强大工具，请参阅[官方文档](https://docs.conda.io/en/latest/miniconda.html)以获取更多信息。

```shell
conda create --name Greptime python=<上一步中特定的Python版本，例如3.10>
conda activate Greptime
```

您可能需要为您的 Python 共享库设置正确的 `LD_LIBRARY_PATH`，例如，对于 Conda 环境，您需要将 `LD_LIBRARY_PATH`（或`DYLD_LIBRARY_PATH`）设置为 `$CONDA_PREFIX/lib`。您可以通过运行`ls $CONDA_PREFIX/lib | grep 'libpython'` 来检查该路径是否包含正确的 Python 共享库，并确认版本是否正确。

### 安装 GreptimeDB

请参考 [安装 GreptimeDB](/getting-started/installation/overview.md)。

## Hello world 实例

让我们从 hello world 实例开始入手：

```python
@coprocessor(returns=['msg'])
def hello() -> vector[str]:
   return "Hello, GreptimeDB"
```

将其保存为 `hello.py`，然后通过 [HTTP API](./define-function.md#http-api) 发布：

### 提交 Python 脚本到 GreptimeDB

```sh
curl --data-binary "@hello.py" -XPOST "http://localhost:4000/v1/scripts?name=hello&db=public"
```

然后在 SQL 中调用：

```sql
select hello();
```

```sql
+-------------------+
| hello()           |
+-------------------+
| Hello, GreptimeDB |
+-------------------+
1 row in set (1.77 sec)
```

或者通过 [HTTP API](./define-function.md#http-api) 进行调用：

```sh
curl -XPOST "http://localhost:4000/v1/run-script?name=hello&db=public"
```

```json
{
  "code": 0,
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "msg",
              "data_type": "String"
            }
          ]
        },
        "rows": [["Hello, GreptimeDB"]]
      }
    }
  ],
  "execution_time_ms": 1917
}
```

函数 `hello` 带有 `@coprocessor` 注解。

`@coprocessor` 中的 `returns` 指定了返回的列名，以及整体的返回格式：

```json
       "schema": {
          "column_schemas": [
            {
              "name": "msg",
              "data_type": "String"
            }
          ]
        }
```

参数列表后面的 `-> vector[str]` 指定了函数的返回类型，都是具有具体类型的 vector。返回类型是生成 coprocessor 函数的输出所必需的。

`hello` 的函数主体返回一个字面字符串 `"Hello, GreptimeDB"`。Coprocessor 引擎将把它转换成一个常量字符串的 vector 并返回它。

总的来说一个协处理器包含三个主要部分：

- `@coprocessor` 注解
- 函数的输入和输出
- 函数主体

我们可以像 SQL UDF(User Defined Function) 一样在 SQL 中调用协处理器，或者通过 HTTP API 调用。

## SQL 实例

将复杂的分析用的 Python 代码（比如下面这个通过 cpu/mem/disk 使用率来确定负载状态的代码）保存到一个文件中（这里命名为 `system_status.py`）：

```python
@coprocessor(args=["host", "idc", "cpu_util", "memory_util", "disk_util"],
             returns = ["host", "idc", "status"],
             sql = "SELECT * FROM system_metrics")
def system_status(hosts, idcs, cpus, memories, disks)\
    -> (vector[str], vector[str], vector[str]):
    statuses = []
    for host, cpu, memory, disk in zip(hosts, cpus, memories, disks):
        if cpu > 80 or memory > 80 or disk > 80:
            statuses.append("red")
            continue

        status = cpu * 0.4 + memory * 0.4 + disk * 0.2

        if status > 80:
            statuses.append("red")
        elif status > 50:
            statuses.append("yello")
        else:
            statuses.append("green")


    return hosts, idcs, statuses

```

上述代码根据 cpu/memory/disk 的使用情况来评估主机状态。参数来自于查询 `system_metrics` 的数据，由 `@coprocessor` 注释中的参数 `sql` 指定（这里是=`"SELECT * FROM system_metrics"`）。查询结果被分配给 `args=[...]` 中的每个位置参数，然后函数返回三个变量，这些变量被转换为三个列 `returns = ["host", "idc", "status"]`。

### 提交 Python 脚本到 GreptimeDB

可以用 `system_status` 将文件提交给 GreptimeDB，这样以后就可以用这个名称来引用并执行它：

```shell
curl  --data-binary "@system_status.py" \
   -XPOST "http://localhost:4000/v1/scripts?name=system_status&db=public"
```

运行该脚本：

```shell
curl  -XPOST \
 "http://localhost:4000/v1/run-script?name=system_status&db=public"
```

以 `json` 格式获取结果：

```json
{
  "code": 0,
  "output": {
    "records": {
      "schema": {
        "column_schemas": [
          {
            "name": "host",
            "data_type": "String"
          },
          {
            "name": "idc",
            "data_type": "String"
          },
          {
            "name": "status",
            "data_type": "String"
          }
        ]
      },
      "rows": [
        ["host1", "idc_a", "green"],
        ["host1", "idc_b", "yello"],
        ["host2", "idc_a", "red"]
      ]
    }
  }
}
```

更多有关 Python 协处理器的信息，请参考[定义函数](./define-function.md)文档。
