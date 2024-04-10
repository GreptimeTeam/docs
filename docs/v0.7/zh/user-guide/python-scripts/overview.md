# 概述

GreptimeDB 支持在数据库内运行 Python 脚本，如果业务逻辑太复杂，无法通过 SQL 表达，则可以使用 Python。Python 目前在数据科学和人工智能领域被广泛使用，为了避免花费大量的时间和精力来传输和转换数据，我们提供了在数据库中执行 Python 脚本的能力。

我们认为 GreptimeDB 中的 Python 脚本是传统 RDMS 中存储过程的完美替代品，同时用户也可以创建 SQL UDFs（用户定义的函数）。

- [入门指南](./getting-started.md)
- [定义函数](./define-function.md)
- [查询数据](./query-data.md)
- [写入数据](./write-data.md)
- [数据类型](./data-types.md)
- [API](./api.md)

所有的例子都可以在 [python-coprocessor-examples](https://github.com/GreptimeTeam/python-coprocessor-examples) 中找到。

# 注意事项

Python 脚本目前正处于实验阶段，API 可能会发生一些变化。

用户可以下载支持 PyO3 的 [pre-built binaries](https://greptime.cn/download)，其文件名后缀为 `pyo3`。也可以通过下载没有 `pyo3` 后缀的 binary 文件直接使用 RustPython，它不需要额外的设置。

如果有库的链接问题，那么需要检查是否设置了正确的 Python 共享库，这可能会有点难度。一般来说，只需要安装 `python-dev` 包（在大多数基于 Debian 的系统上）。然而，如果用户使用 Homebrew 在 macOS 上安装 Python，则必须创建一个适当的链接到 `Library/Frameworks/Python.framework`。

推荐利用 `Conda` 来管理 Python 环境。首先，用下载的 binary 文件所要求的相同版本的 Python 创建一个 Python 环境。或者，可以使用一个 docker 容器，在其中执行 `greptime` binary。

另一个可行方案，但并非推荐方案：手动安装所需的 Python 版本，并将 `LD_LIBRARY_PATH`环境变量设置为包含 `libpython<VERSION>.so` 文件的目录。`<VERSION>` 的版本号根据所使用的 Python 的版本而不同。

两个 Python 脚本的后端：

1. RustPython 解释器：无需安装任何 Python 库就可以支持，但它没有 CPython 后端那么快。名称中没有 `pyo3` 的 Release Binary 使用 RustPython Interpreter。虽然仍然可以在 RustPython 解释器中使用 Python 语法，但不能使用任何第三方的库。
2. CPython 解释器：这是最常用的 Python 版本。它允许使用各种第三方库，但需要安装正确的 Python 共享库。任何名称中带有 `pyo3` 的 Release Binary 都使用 CPython Interpreter。
