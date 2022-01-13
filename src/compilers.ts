import * as path from 'path';

import { pathExists } from './utils/fileUtils';

export function checkCompilersWindows() {
  let cygwinFromEnvPath: string | undefined;
  const env = process.env;
  if (env['PATH']) {
    let paths: string[] = [];
    paths = env['PATH'].split(';');

    paths = paths.filter((path: string) =>
      path.toLowerCase().includes('cygwin'),
    );

    cygwinFromEnvPath = paths[0];
  }

  const searchCygwin64 = 'C:/cygwin64/bin/';
  const searchCygwin32 = 'C:/cygwin/bin/';
  let cygwinInstallation: string;

  if (cygwinFromEnvPath && pathExists(cygwinFromEnvPath)) {
    cygwinInstallation = cygwinFromEnvPath;
  } else if (pathExists(searchCygwin64)) {
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

function getDebuggerPath(userPath: string, c_compiler_path: string) {
  let debugger_path: string;
  if (c_compiler_path.includes('clang')) {
    debugger_path = path.join(userPath, 'lldb');
    if (!pathExists(debugger_path)) {
      debugger_path = 'lldb';
    }
  } else {
    debugger_path = path.join(userPath, 'gdb');
    if (!pathExists(debugger_path)) {
      debugger_path = 'gdb';
    }
  }

  return debugger_path;
}

export function checkCompilersLinux() {
  const userPath = '/usr/bin/';

  let c_compiler_path = path.join(userPath, 'gcc');
  if (!pathExists(c_compiler_path)) {
    c_compiler_path = path.join(userPath, 'clang');
    if (!pathExists(c_compiler_path)) {
      c_compiler_path = 'gcc';
    }
  }

  let cpp_compiler_path = path.join(userPath, 'g++');
  if (!pathExists(cpp_compiler_path)) {
    cpp_compiler_path = path.join(userPath, 'clang++');
    if (!pathExists(cpp_compiler_path)) {
      cpp_compiler_path = 'g++';
    }
  }

  const debugger_path = getDebuggerPath(userPath, c_compiler_path);

  let make_path = path.join(userPath, 'make');
  if (!pathExists(make_path)) make_path = 'make';

  return { c_compiler_path, cpp_compiler_path, debugger_path, make_path };
}

export function checkCompilersMac() {
  const userPath = '/usr/bin/';

  let c_compiler_path = path.join(userPath, 'clang');
  if (!pathExists(c_compiler_path)) {
    c_compiler_path = path.join(userPath, 'gcc');
    if (!pathExists(c_compiler_path)) {
      c_compiler_path = 'clang';
    }
  }

  let cpp_compiler_path = path.join(userPath, 'clang++');
  if (!pathExists(cpp_compiler_path)) {
    cpp_compiler_path = path.join(userPath, 'g++');
    if (!pathExists(cpp_compiler_path)) {
      cpp_compiler_path = 'clang++';
    }
  }

  const debugger_path = getDebuggerPath(userPath, c_compiler_path);

  let make_path = path.join(userPath, 'make');
  if (!pathExists(make_path)) make_path = 'make';

  return { c_compiler_path, cpp_compiler_path, debugger_path, make_path };
}
