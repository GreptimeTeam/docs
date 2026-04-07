---
keywords: [Python 脚本, 数据分析, CPython, RustPython]
description: 介绍了在 GreptimeDB 中使用 Python 脚本进行数据分析的两种后端实现：CPython 和嵌入式 RustPython 解释器。
---

# Python 脚本

## 简介

Python 脚本是分析本地数据库中的数据的便捷方式，
通过将脚本直接在数据库内运行而不是从数据库拉取数据的方式，可以节省大量的数据传输时间。
下图描述了 Python 脚本的工作原理。
`RecordBatch`（基本上是表中的一列，带有类型和元数据）可以来自数据库中的任何地方，
而返回的 `RecordBatch` 可以用 Python 语法注释以指示其元数据，例如类型或空。
脚本将尽其所能将返回的对象转换为 `RecordBatch`，无论它是 Python 列表、从参数计算出的 `RecordBatch` 还是常量（它被扩展到与输入参数相同的长度）。

![Python Coprocessor](/python-coprocessor.png)

## 两种可选的后端

### CPython 后端

该后端由 [PyO3](https://pyo3.rs/v0.18.1/) 提供支持，可以使用您最喜欢的 Python 库（如 NumPy、Pandas 等），并允许 Conda 管理您的 Python 环境。

但是使用它也涉及一些复杂性。您必须设置正确的 Python 共享库，这可能有点棘手。一般来说，您只需要安装 `python-dev` 包。但是，如果您使用 Homebrew 在 macOS 上安装 Python，则必须创建一个适当的软链接到 `Library/Frameworks/Python.framework`。有关使用 PyO3 crate 与不同 Python 版本的详细说明，请参见 [这里](https://pyo3.rs/v0.18.1/building_and_distribution#configuring-the-python-version)

### 嵌入式 RustPython 解释器

可以运行脚本的实验性 [python 解释器](https://github.com/RustPython/RustPython)，它支持 Python 3.10 语法。您可以使用所有的 Python 语法，更多信息请参见 [Python 脚本的用户指南](/user-guide/python-scripts/overview.md).

