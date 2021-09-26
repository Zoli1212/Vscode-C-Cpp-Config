import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import {
	mkdirRecursive,
	pathExists,
	readJsonFile,
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
  '.editorconfig',
  '.gitattributes',
  '.gitignore',
];

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
    writeFiles,
    false,
  );

  context?.subscriptions.push(generateCCommandDisposable);
}

function initGenerateCppCommandDisposable(context: vscode.ExtensionContext) {
  if (generateCppCommandDisposable) return;

  const CommanddName = `${EXTENSION_NAME}.generateConfigCpp`;
  generateCppCommandDisposable = vscode.commands.registerCommand(
    CommanddName,
    writeFiles,
    true,
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
  if (!extensionPath || !workspaceFolder) return {};

  const operatingSystem = getOperatingSystem();

  const templateOsPath = path.join(extensionPath, 'templates', operatingSystem);
  const templatePath = path.join(extensionPath, 'templates');
  const vscodePath = path.join(workspaceFolder, '.vscode');

  return { templateOsPath, templatePath, vscodePath };
}

function checkCompilers() {
  const operatingSystem = getOperatingSystem();

  if (operatingSystem === OperatingSystems.windows) {
    return checkCompilersWindows();
  } else if (operatingSystem === OperatingSystems.linux) {
    return checkCompilersLinux();
  } else {
    return checkCompilersMac();
  }
}

function checkCompilersWindows() {
  const searchCygwin64 = 'C:/cygwin64/bin/';
  let cygwinInstallation: string;

  if (!pathExists(searchCygwin64)) {
    vscode.window.showErrorMessage('Cygwin installation not found');
    return false;
  } else {
    cygwinInstallation = searchCygwin64;
  }

  let installationIncomplete = false;
  const gccPath = path.join(cygwinInstallation, 'gcc.exe');
  const gppPath = path.join(cygwinInstallation, 'g++.exe');
  const gdbPath = path.join(cygwinInstallation, 'gdb.exe');
  const makePath = path.join(cygwinInstallation, 'make.exe');

  if (!pathExists(gccPath)) installationIncomplete = true;
  if (!pathExists(gppPath)) installationIncomplete = true;
  if (!pathExists(gdbPath)) installationIncomplete = true;
  if (!pathExists(makePath)) installationIncomplete = true;

  if (installationIncomplete) {
    vscode.window.showErrorMessage('Cygwin installation incomplete');
    return false;
  }

  return true;
}

function checkCompilersLinux() {
  const userPath = '/usr/bin/';
  let installationIncomplete = false;

  const gccUserPath = path.join(userPath, 'gcc');
  const gppUserPath = path.join(userPath, 'g++');
  const gdbUserPath = path.join(userPath, 'gdb');
  const makeUserPath = path.join(userPath, 'make');

  if (!pathExists(gccUserPath)) installationIncomplete = true;
  if (!pathExists(gppUserPath)) installationIncomplete = true;
  if (!pathExists(gdbUserPath)) installationIncomplete = true;
  if (!pathExists(makeUserPath)) installationIncomplete = true;

  if (installationIncomplete) {
    vscode.window.showErrorMessage('Compiler installation incomplete');
    return false;
  }

  return true;
}

function checkCompilersMac() {
  const userPath = '/usr/bin/';
  let installationIncomplete = false;

  const gccUserPath = path.join(userPath, 'clang');
  const gppUserPath = path.join(userPath, 'clang++');
  const gdbUserPath = path.join(userPath, 'lldb');
  const makeUserPath = path.join(userPath, 'make');

  if (!pathExists(gccUserPath)) installationIncomplete = true;
  if (!pathExists(gppUserPath)) installationIncomplete = true;
  if (!pathExists(gdbUserPath)) installationIncomplete = true;
  if (!pathExists(makeUserPath)) installationIncomplete = true;

  if (installationIncomplete) {
    vscode.window.showErrorMessage('Compiler installation incomplete');
    return false;
  }

  return true;
}

function writeFiles(isCppCommand: boolean) {
  const { templateOsPath, templatePath, vscodePath } = getFilepaths();
  if (!templateOsPath || !templatePath || !vscodePath) return;

  const toolsInstalled = checkCompilers();
  if (!toolsInstalled) return;

  if (!pathExists(vscodePath)) mkdirRecursive(vscodePath);

  VSCODE_DIR_FILES.forEach((filename) => {
    const targetFilename = path.join(vscodePath, filename);
    const templateFilename = path.join(templatePath, filename);
    const templateOsFilename = path.join(templateOsPath, filename);

    if (pathExists(targetFilename)) return;

    if (filename === 'launch.json') {
      let templateData: { [key: string]: string } = readJsonFile(
        templateOsFilename,
      );
      if (isCppCommand) templateData = replaceLanguageLaunch(templateData);
      writeJsonFile(targetFilename, templateData);
    } else if (
      filename === 'c_cpp_properties.json' ||
      filename === 'settings.json'
    ) {
      const templateData: { [key: string]: string } = readJsonFile(
        templateOsFilename,
      );
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

  const toolsInstalled = checkCompilers();
  if (!toolsInstalled) return;

  if (!pathExists(vscodePath)) mkdirRecursive(vscodePath);

  writeLocalVscodeDirMinimalFiles(vscodePath, templateOsPath);
  writeRootDirFiles(templatePath);
}

function writeRootDirFiles(templatePath: string) {
  ROOT_DIR_FILES.forEach((filename) => {
    if (!workspaceFolder) return;

    const targetFilename = path.join(workspaceFolder, filename);
    const templateFilename = path.join(templatePath, filename);

    if (pathExists(targetFilename)) return;

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

    if (pathExists(targetFilename)) return;

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
  data['tasks'][2]['args'][5] = 'C_COMPILER=${config:compilerCpp}';
  data['tasks'][2]['args'][6] = 'LANGUAGE_MODE=Cpp';

  data['tasks'][3]['label'] = data['tasks'][3]['label'].replace('C:', 'Cpp:');
  data['tasks'][3]['args'][5] = 'C_COMPILER=${config:compilerCpp}';
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
