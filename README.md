# VSCode C/C++ Config

Creates all needed config files for simple C/C++ projects.  

If the standard command is used, following files will be created in the local .vscode folder:

- settings.json: Best default settings for C/C++, CMake etc. extensions
- c_cpp_properties.json: Best default settings for the compiler
- tasks.json: Tasks to compile single C/C++ files or all C/C++ files in a folder
- launch.json: Debug configs to debug C/C++ programs that were compiled by the tasks
- Makefile: Makefile targets that are used in launch.json and tasks.json

if the minimal command is used, following files will be created in the local .vscode folder:

- settings.json: Best default settings for C/C++, CMake etc. extensions
- c_cpp_properties.json: Best default settings for the compiler

Following files will be created in the root directory:

- .clang-format: Formatting style if the user wants to use clang-format
- .editorconfig: Standard file settings (line-feed, insert new-line, etc.)

**Note**: If one of these files already exists, they won't be overridden.

## Software Requirements

- 🔧 Windows: gcc/g++/gdb with Cygwin64 (assuming installed at **C:/cygwin64/**)
- 🔧 Linux: gcc/g++/gdb with package manager (e.g. apt-get on Debian)
- 🔧 MacOS: clang/clang++/lldb with xcode

## How to use

Just run the command 'Generate C Config Files', 'Generate C++ Config Files', 'Generate C Config Files Minimal' or 'Generate C++ Config Files Minimal' in VSCode's command palette.

## Important Notes

The generated tasks won't work whenever there are whitespaces or non-ASCII characters in the file paths and directory names.

## Release Notes

Refer to the [CHANGELOG](CHANGELOG.md).

## License

Copyright (C) 2021 Jan Schaffranek.  
Licensed under the [MIT License](LICENSE).
