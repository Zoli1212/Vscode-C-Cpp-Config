import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import {
	mkdirRecursive,
	pathExists,
	readJsonFile,
	replaceBackslashes,
	writeJsonFile,
} from './utils/fileUtils';
import { getOperatingSystem } from './utils/systemUtils';
import { OperatingSystems } from './utils/types';
import { disposeItem } from './utils/vscodeUtils';

let generateCCommandDisposable: vscode.Disposable | undefined;
let generateCppCommandDisposable: vscode.Disposable | undefined;
let generateCMinimalCommandDisposable: vscode.Disposable | undefined;
let generateCppMinimalCommandDisposable: vscode.Disposable | undefined;
let workspaceFolder: string | undefined;
let extensionPath: string | undefined;
let operatingSystem: OperatingSystems | undefined;

const EXTENSION_NAME = 'C_Cpp_Config';
const VSCODE_DIR_FILES = [
  'launch.json',
  'tasks.json',
  'settings.json',
  'c_cpp_properties.json',
  'Makefile',
];
const VSCODE_DIR_MINIMAL_FILES = ['settings.json', 'c_cpp_properties.json'];
const ROOT_DIR_FILES = [
  '.clang-format',
  '.clang-tidy',
  '.editorconfig',
  '.gitattributes',
  '.gitignore',
];

let C_COMPILER_PATH: string = 'gcc';
let CPP_COMPILER_PATH: string = 'g++';
let DEBUGGER_PATH: string = 'gdb';
let MAKE_PATH: string = 'make';

export function activate(context: vscode.ExtensionContext) {
  if (
    !vscode.workspace.workspaceFolders ||
    vscode.workspace.workspaceFolders.length !== 1 ||
    !vscode.workspace.workspaceFolders[0] ||
    !vscode.workspace.workspaceFolders[0].uri
  ) {
    return;
  }

  workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
  extensionPath = context.extensionPath;
  operatingSystem = getOperatingSystem();

  initGenerateCCommandDisposable(context);
  initGenerateCppCommandDisposable(context);
  initGenerateCMinimalCommandDisposable(context);
  initGenerateCppMinimalCommandDisposable(context);
}

export function deactivate() {
  disposeItem(generateCCommandDisposable);
}

function initGenerateCCommandDisposable(context: vscode.ExtensionContext) {
  if (generateCCommandDisposable) return;

  const CommanddName = `${EXTENSION_NAME}.generateConfigC`;
  generateCCommandDisposable = vscode.commands.registerCommand(
    CommanddName,
    () => {
      writeFiles(false);
    },
  );

  context?.subscriptions.push(generateCCommandDisposable);
}

function initGenerateCppCommandDisposable(context: vscode.ExtensionContext) {
  if (generateCppCommandDisposable) return;

  const CommanddName = `${EXTENSION_NAME}.generateConfigCpp`;
  generateCppCommandDisposable = vscode.commands.registerCommand(
    CommanddName,
    () => {
      writeFiles(true);
    },
  );

  context?.subscriptions.push(generateCppCommandDisposable);
}

function initGenerateCMinimalCommandDisposable(
  context: vscode.ExtensionContext,
) {
  if (generateCMinimalCommandDisposable) return;

  const CommanddName = `${EXTENSION_NAME}.generateConfigCMinimal`;
  generateCMinimalCommandDisposable = vscode.commands.registerCommand(
    CommanddName,
    writeMinimalFiles,
  );

  context?.subscriptions.push(generateCMinimalCommandDisposable);
}

function initGenerateCppMinimalCommandDisposable(
  context: vscode.ExtensionContext,
) {
  if (generateCppMinimalCommandDisposable) return;

  const CommanddName = `${EXTENSION_NAME}.generateConfigCppMinimal`;
  generateCppMinimalCommandDisposable = vscode.commands.registerCommand(
    CommanddName,
    writeMinimalFiles,
  );

  context?.subscriptions.push(generateCppMinimalCommandDisposable);
}

function getFilepaths() {
  if (!extensionPath || !workspaceFolder || !operatingSystem) {
    return {};
  }

  const templateOsPath = path.join(extensionPath, 'templates', operatingSystem);
  const templatePath = path.join(extensionPath, 'templates');
  const vscodePath = path.join(workspaceFolder, '.vscode');

  return { templateOsPath, templatePath, vscodePath };
}

function checkCompilers() {
  if (!operatingSystem) return;

  if (operatingSystem === OperatingSystems.windows) {
    checkCompilersWindows();
  } else if (operatingSystem === OperatingSystems.linux) {
    checkCompilersLinux();
  } else {
    checkCompilersMac();
  }
}

function checkCompilersWindows() {
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

  C_COMPILER_PATH = path.join(cygwinInstallation, 'gcc.exe');
  CPP_COMPILER_PATH = path.join(cygwinInstallation, 'g++.exe');
  DEBUGGER_PATH = path.join(cygwinInstallation, 'gdb.exe');
  MAKE_PATH = path.join(cygwinInstallation, 'make.exe');
}

function checkCompilersLinux() {
  const userPath = '/usr/bin/';

  C_COMPILER_PATH = path.join(userPath, 'gcc');
  CPP_COMPILER_PATH = path.join(userPath, 'g++');
  DEBUGGER_PATH = path.join(userPath, 'gdb');
  MAKE_PATH = path.join(userPath, 'make');

  if (!pathExists(C_COMPILER_PATH)) C_COMPILER_PATH = 'gcc';
  if (!pathExists(CPP_COMPILER_PATH)) CPP_COMPILER_PATH = 'g++';
  if (!pathExists(DEBUGGER_PATH)) DEBUGGER_PATH = 'gdb';
  if (!pathExists(MAKE_PATH)) MAKE_PATH = 'make';
}

function checkCompilersMac() {
  const userPath = '/usr/bin/';

  C_COMPILER_PATH = path.join(userPath, 'clang');
  CPP_COMPILER_PATH = path.join(userPath, 'clang++');
  DEBUGGER_PATH = path.join(userPath, 'lldb');
  MAKE_PATH = path.join(userPath, 'make');

  if (!pathExists(C_COMPILER_PATH)) C_COMPILER_PATH = 'gcc';
  if (!pathExists(CPP_COMPILER_PATH)) CPP_COMPILER_PATH = 'g++';
  if (!pathExists(DEBUGGER_PATH)) DEBUGGER_PATH = 'gdb';
  if (!pathExists(MAKE_PATH)) MAKE_PATH = 'make';
}

function writeFiles(isCppCommand: boolean) {
  const { templateOsPath, templatePath, vscodePath } = getFilepaths();
  if (!templateOsPath || !templatePath || !vscodePath) return;

  checkCompilers();

  if (!pathExists(vscodePath)) mkdirRecursive(vscodePath);

  VSCODE_DIR_FILES.forEach((filename) => {
    const targetFilename = path.join(vscodePath, filename);
    const templateFilename = path.join(templatePath, filename);
    const templateOsFilename = path.join(templateOsPath, filename);

    if (filename === 'launch.json') {
      let templateData: { [key: string]: string } = readJsonFile(
        templateOsFilename,
      );
      if (isCppCommand) templateData = replaceLanguageLaunch(templateData);
      if (
        operatingSystem !== undefined &&
        operatingSystem !== OperatingSystems.mac
      ) {
        templateData = replaceLaunch(templateData);
      }
      writeJsonFile(targetFilename, templateData);
    } else if (filename === 'c_cpp_properties.json') {
      let templateData: { [key: string]: string } = readJsonFile(
        templateOsFilename,
      );
      templateData = replaceProperties(templateData);
      writeJsonFile(targetFilename, templateData);
    } else if (filename === 'settings.json') {
      let templateData: { [key: string]: string } = readJsonFile(
        templateOsFilename,
      );
      templateData = replaceSettings(templateData);
      writeJsonFile(targetFilename, templateData);
    } else if (filename === 'tasks.json') {
      let templateData: { [key: string]: string } = readJsonFile(
        templateFilename,
      );
      if (isCppCommand) templateData = replaceLanguageTasks(templateData);
      writeJsonFile(targetFilename, templateData);
    } else {
      // Makefile
      const templateData = fs.readFileSync(templateFilename);
      fs.writeFileSync(targetFilename, templateData);
    }
  });

  writeRootDirFiles(templatePath);
}

function writeMinimalFiles() {
  const { templateOsPath, templatePath, vscodePath } = getFilepaths();
  if (!templateOsPath || !templatePath || !vscodePath) return;

  checkCompilers();

  if (!pathExists(vscodePath)) mkdirRecursive(vscodePath);

  writeLocalVscodeDirMinimalFiles(vscodePath, templateOsPath);
  writeRootDirFiles(templatePath);
}

function writeRootDirFiles(templatePath: string) {
  ROOT_DIR_FILES.forEach((filename) => {
    if (!workspaceFolder) return;

    const targetFilename = path.join(workspaceFolder, filename);
    const templateFilename = path.join(templatePath, filename);

    const templateData = fs.readFileSync(templateFilename);
    fs.writeFileSync(targetFilename, templateData);
  });
}

function writeLocalVscodeDirMinimalFiles(
  vscodePath: string,
  templateOsPath: string,
) {
  VSCODE_DIR_MINIMAL_FILES.forEach((filename) => {
    const targetFilename = path.join(vscodePath, filename);
    const templateOsFilename = path.join(templateOsPath, filename);

    let templateData: { [key: string]: any } = readJsonFile(templateOsFilename);
    templateData = removeFullEntries(templateData);
    writeJsonFile(targetFilename, templateData);
  });
}

function replaceLanguageLaunch(data: { [key: string]: any }) {
  data['configurations'][0]['name'] = data['configurations'][0]['name'].replace(
    'C:',
    'Cpp:',
  );
  data['configurations'][0]['preLaunchTask'] = data['configurations'][0][
    'preLaunchTask'
  ].replace('C:', 'Cpp:');

  data['configurations'][1]['name'] = data['configurations'][1]['name'].replace(
    'C:',
    'Cpp:',
  );
  data['configurations'][1]['preLaunchTask'] = data['configurations'][1][
    'preLaunchTask'
  ].replace('C:', 'Cpp:');

  return data;
}

function replaceLanguageTasks(data: { [key: string]: any }) {
  data['tasks'][0]['args'][4] = 'CPP_COMPILER=${config:compilerCpp}';
  data['tasks'][0]['args'][5] = 'LANGUAGE_MODE=Cpp';

  data['tasks'][1]['args'][4] = 'CPP_COMPILER=${config:compilerCpp}';
  data['tasks'][1]['args'][5] = 'LANGUAGE_MODE=Cpp';

  data['tasks'][2]['label'] = data['tasks'][2]['label'].replace('C:', 'Cpp:');
  data['tasks'][2]['args'][5] = 'CPP_COMPILER=${config:compilerCpp}';
  data['tasks'][2]['args'][6] = 'LANGUAGE_MODE=Cpp';

  data['tasks'][3]['label'] = data['tasks'][3]['label'].replace('C:', 'Cpp:');
  data['tasks'][3]['args'][5] = 'CPP_COMPILER=${config:compilerCpp}';
  data['tasks'][3]['args'][6] = 'LANGUAGE_MODE=Cpp';

  data['tasks'][4]['label'] = data['tasks'][4]['label'].replace('C:', 'Cpp:');
  data['tasks'][5]['label'] = data['tasks'][5]['label'].replace('C:', 'Cpp:');

  return data;
}

function removeFullEntries(data: { [key: string]: any }) {
  delete data['compilerC'];
  delete data['compilerCpp'];
  delete data['make'];

  return data;
}

function replaceSettings(data: { [key: string]: any }) {
  data['compilerC'] = replaceValueBasedOnEnv(C_COMPILER_PATH);
  data['compilerCpp'] = replaceValueBasedOnEnv(CPP_COMPILER_PATH);
  data['make'] = replaceValueBasedOnEnv(MAKE_PATH);

  return data;
}

function replaceLaunch(data: { [key: string]: any }) {
  data['configurations'][0]['miDebuggerPath'] = replaceValueBasedOnEnv(
    DEBUGGER_PATH,
  );
  data['configurations'][1]['miDebuggerPath'] = replaceValueBasedOnEnv(
    DEBUGGER_PATH,
  );

  return data;
}

function replaceProperties(data: { [key: string]: any }) {
  data['configurations'][0]['compilerPath'] = replaceValueBasedOnEnv(
    C_COMPILER_PATH,
  );

  return data;
}

function replaceValueBasedOnEnv(path: string) {
  if (operatingSystem === OperatingSystems.windows) {
    path = replaceBackslashes(path);
  }

  return path;
}
