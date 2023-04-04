# Python Coprocessor

Python prevails in the data science and AI world. To avoid spending lots of time and effort transferring and transforming data, we provide the capability of executing Python scripts in the database. We call it the python coprocessor: co-processing for time series data analysis and processing.
We think the python coprocessor in GreptimeDB is a perfect replacement for stored procedures in traditional RDMS, and also the user can create SQL UDF(User Defined Function) by defining coprocessors.

* [Hello, world](./hello.md)
* [Coprocessor](./coprocessor.md)
* [Vector](./vector.md)
* [Input and Output](./io.md)
* [Query Data](./query-data.md)
* [Insert Data](./insert-data.md)
* [Builtin Module](./builtins.md)
* [Third-parties Libs](./third-parties.md)
* [FAQ](./faq.md)

All the examples can be found in [python-coprocessor-examples](https://github.com/GreptimeTeam/python-coprocessor-examples).

# Note:
The Python coprocessor is currently in its experimental phase, and the API may undergo some changes.

You can download [pre-built binaries](https://github.com/GreptimeTeam/greptimedb/releases) with PyO3 supported whose file names are postfixed by `pyo3`.You can just also use RustPython which doesn't require additional setup by download binary files without `pyo3` postfixed.

If you have some library link issues,  you must set up the correct Python shared library, which can be a bit challenging. In general, you just need to install the `python-dev` package(on most Debian-based system). However, if you are using Homebrew to install Python on macOS, you must create a proper soft link to `Library/Frameworks/Python.framework`.
The recommended way is to utilize `conda` for managing your Python environment. Firstly, create a Python environment with the same version of Python demanded by the binary you download. Alternatively, you can employ a docker container and execute the `greptime` binary within it.
A less recommended way is to manually install the exact version of Python required and set the `LD_LIBRARY_PATH` environment variable to the directory containing the `libpython<VERSION>.so` file. The version number of `<VERSION>` varies according to the version of Python being used.

There is two Backend for Python Coprocessor:
1. RustPython Interpreter: this is supported without installing any Python library, but it is not as fast as CPython Backend. The Release Binary without `pyo3` in its name uses RustPython Interpreter. While you can still use Python Syntax in RustPython Interpreter,  you can't use any third-parties libs.
2. CPython Interpreter: this is the most commonly used version of Python. It allows you to use all sorts of third-parties libs, but you need to install the correct Python shared library. Any Release Binary with `pyo3` in its name uses CPython Interpreter.