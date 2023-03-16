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

# Note:
The Python coprocessor is currently in its experimental phase, and the API may undergo some changes.

Using it also involves some complications. You must set up the correct Python shared library, which can be a bit challenging. In general, you just need to install the `python-dev` package(on most Debian-based system). However, if you are using Homebrew to install Python on macOS, you must create a proper soft link to `Library/Frameworks/Python.framework`.

So if you can't run your binary on macOS due to a linking error, you can try to fix it as below:
1. Open your Python and run the following code to get your python shared library path:
```python
from sysconfig import get_config_var, get_platform
get_config_var("LIBDIR")
```
This should give you something like `'/Applications/Xcode.app/Contents/Developer/Library/Frameworks/Python3.framework/Versions/3.9/lib'`.

2. Create a config file named `pyo3.config` in the same directory of your binary, and add the following content:
```config
implementation=CPython
version=3.9
shared=true
abi3=false
lib_name=python3.9
lib_dir=<Your LIB_DIR get from step 1>
executable=<You python executable path, could come from `which python`>
pointer_width=64
build_flags=
suppress_build_script_link_lines=false
```
You might also need to change the `version` and `lib_name` to correspond with your specific version of Python.