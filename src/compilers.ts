import path from 'path';

import { pathExists } from './utils/fileUtils';

export function checkCompilersWindows() {
  const searchCygwin64 = 'C:/cygwin64/bin/';
  const searchCygwin32 = 'C:/cygwin/bin/';
  let cygwinInstallation: string;

  if (pathExists(searchCygwin64)) {
    cygwinInstallation = searchCygwin64;
  } else if (pathExists(searchCygwin32)) {
    cygwinInstallation = searchCygwin32;
  } else {
    cygwinInstallation = '';
  }

  const c_compiler_path = path.join(cygwinInstallation, 'gcc.exe');
  const cpp_compiler_path = path.join(cygwinInstallation, 'g++.exe');
  const debugger_path = path.join(cygwinInstallation, 'gdb.exe');
  const make_path = path.join(cygwinInstallation, 'make.exe');

  return { c_compiler_path, cpp_compiler_path, debugger_path, make_path };
}

export function checkCompilersLinux() {
  const userPath = '/usr/bin/';

  let c_compiler_path = path.join(userPath, 'gcc');
  let cpp_compiler_path = path.join(userPath, 'g++');
  let debugger_path = path.join(userPath, 'gdb');
  let make_path = path.join(userPath, 'make');

  if (!pathExists(c_compiler_path)) c_compiler_path = 'gcc';
  if (!pathExists(cpp_compiler_path)) cpp_compiler_path = 'g++';
  if (!pathExists(debugger_path)) debugger_path = 'gdb';
  if (!pathExists(make_path)) make_path = 'make';

  return { c_compiler_path, cpp_compiler_path, debugger_path, make_path };
}

export function checkCompilersMac() {
  const userPath = '/usr/bin/';

  let c_compiler_path = path.join(userPath, 'clang');
  let cpp_compiler_path = path.join(userPath, 'clang++');
  let debugger_path = path.join(userPath, 'lldb');
  let make_path = path.join(userPath, 'make');

  if (!pathExists(c_compiler_path)) c_compiler_path = 'gcc';
  if (!pathExists(cpp_compiler_path)) cpp_compiler_path = 'g++';
  if (!pathExists(debugger_path)) debugger_path = 'gdb';
  if (!pathExists(make_path)) make_path = 'make';

  return { c_compiler_path, cpp_compiler_path, debugger_path, make_path };
}
