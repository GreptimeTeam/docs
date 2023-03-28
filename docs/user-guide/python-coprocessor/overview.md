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
The recommended way is to use `conda` for managing your Python environment, you must create a Python environment with the same version of Python as the binary you download requires(Or just use docker container) and run the `greptime` binary inside it. A less recommended way is to install the exact version of python manually, and set the `LD_LIBRARY_PATH` environment variable to the directory where the `libpython<VERSION>.so`(the number of <VERSION> depends on the version of Python where ) file is located.

There is two Backend for Python Coprocessor:
1. RustPython Interpreter: this is supported without need to install any python library, but it is not as fast as CPython Backend. Release Binary without `pyo3` in its name is using RustPython Interpreter. You can still use Python Syntax in RustPython Interpreter, but you can't use any third-parties libs.
2. CPython Interpreter: this is the usual and most common python, using it allows you to use all sort of third-parties libs, but you need to install the correct Python shared library. Release Binary with `pyo3` in its name is using CPython Interpreter.