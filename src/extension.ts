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
let workspaceFolder: string | undefined;
let extensionPath: string | undefined;

const EXTENSION_NAME = 'C_Cpp_Config';
const FILES = [
  'launch.json',
  'tasks.json',
  'settings.json',
  'c_cpp_properties.json',
  'Makefile',
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

  initgenerateCCommandDisposable(context);
  initgenerateCppCommandDisposable(context);
}

export function deactivate() {
  disposeItem(generateCCommandDisposable);
}

function initgenerateCCommandDisposable(context: vscode.ExtensionContext) {
  if (generateCCommandDisposable) return;

  const CommanddName = `${EXTENSION_NAME}.generateConfigC`;
  generateCCommandDisposable = vscode.commands.registerCommand(
    CommanddName,
    async () => {
      const { templateOsPath, templatePath, targetPath } = getFilepaths();
      if (!templateOsPath || !templatePath || !targetPath) return;

      const toolsInstalled = checkCompilers();
      if (!toolsInstalled) return;

      if (!pathExists(targetPath)) mkdirRecursive(targetPath);

      FILES.forEach((filename) => {
        const targetFilename = path.join(targetPath, filename);
        const templateFilename = path.join(templatePath, filename);
        const templateOsFilename = path.join(templateOsPath, filename);

        if (filename === 'launch.json') {
          const templateData: { [key: string]: string } = readJsonFile(
            templateOsFilename,
          );
          writeJsonFile(targetFilename, templateData);
        } else if (
          filename === 'c_cpp_properties.json' ||
          filename === 'settings.json'
        ) {
          const templateData = fs.readFileSync(templateOsFilename);
          fs.writeFileSync(targetFilename, templateData);
        } else if (filename === 'tasks.json') {
          const templateData: { [key: string]: string } = readJsonFile(
            templateFilename,
          );
          writeJsonFile(targetFilename, templateData);
        } else {
          // Makefile
          const templateData = fs.readFileSync(templateFilename);
          fs.writeFileSync(targetFilename, templateData);
        }
      });
    },
  );

  context?.subscriptions.push(generateCCommandDisposable);
}

function initgenerateCppCommandDisposable(context: vscode.ExtensionContext) {
  if (generateCppCommandDisposable) return;

  const CommanddName = `${EXTENSION_NAME}.generateConfigCpp`;
  generateCppCommandDisposable = vscode.commands.registerCommand(
    CommanddName,
    async () => {
      const { templateOsPath, templatePath, targetPath } = getFilepaths();
      if (!templateOsPath || !templatePath || !targetPath) return;

      const toolsInstalled = checkCompilers();
      if (!toolsInstalled) return;

      if (!pathExists(targetPath)) mkdirRecursive(targetPath);

      FILES.forEach((filename) => {
        const targetFilename = path.join(targetPath, filename);
        const templateFilename = path.join(templatePath, filename);
        const templateOsFilename = path.join(templateOsPath, filename);

        if (filename === 'launch.json') {
          let templateData: { [key: string]: string } = readJsonFile(
            templateOsFilename,
          );
          templateData = replaceLanguageLaunch(templateData);
          writeJsonFile(targetFilename, templateData);
        } else if (
          filename === 'c_cpp_properties.json' ||
          filename === 'settings.json'
        ) {
          const templateData = fs.readFileSync(templateOsFilename);
          fs.writeFileSync(targetFilename, templateData);
        } else if (filename === 'tasks.json') {
          let templateData: { [key: string]: string } = readJsonFile(
            templateFilename,
          );
          templateData = replaceLanguageTasks(templateData);
          writeJsonFile(targetFilename, templateData);
        } else {
          // Makefile
          const templateData = fs.readFileSync(templateFilename);
          fs.writeFileSync(targetFilename, templateData);
        }
      });
    },
  );

  context?.subscriptions.push(generateCppCommandDisposable);
}

function getFilepaths() {
  if (!extensionPath || !workspaceFolder) return {};

  const operatingSystem = getOperatingSystem();

  const templateOsPath = path.join(extensionPath, 'templates', operatingSystem);
  const templatePath = path.join(extensionPath, 'templates');
  const targetPath = path.join(workspaceFolder, '.vscode');

  return { templateOsPath, templatePath, targetPath };
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
  const globalPath = '/bin/';
  const localPath = '/usr/local/bin/';
  let installationIncomplete = false;

  const gccUserPath = path.join(userPath, 'gcc');
  const gppUserPath = path.join(userPath, 'g++');
  const gdbUserPath = path.join(userPath, 'gdb');
  const makeUserPath = path.join(userPath, 'make');

  const gccGlobalPath = path.join(globalPath, 'gcc');
  const gppGlobalPath = path.join(globalPath, 'g++');
  const gdbGlobalPath = path.join(globalPath, 'gdb');
  const makeGlobalPath = path.join(globalPath, 'make');

  const gccLocalPath = path.join(localPath, 'gcc');
  const gppLocalPath = path.join(localPath, 'g++');
  const gdbLocalPath = path.join(localPath, 'gdb');
  const makeLocalPath = path.join(localPath, 'make');

  if (
    !pathExists(gccUserPath) &&
    !pathExists(gccGlobalPath) &&
    !pathExists(gccLocalPath)
  )
    installationIncomplete = true;
  if (
    !pathExists(gppUserPath) &&
    !pathExists(gppGlobalPath) &&
    !pathExists(gppLocalPath)
  )
    installationIncomplete = true;
  if (
    !pathExists(gdbUserPath) &&
    !pathExists(gdbGlobalPath) &&
    !pathExists(gdbLocalPath)
  )
    installationIncomplete = true;
  if (
    !pathExists(makeUserPath) &&
    !pathExists(makeGlobalPath) &&
    !pathExists(makeLocalPath)
  )
    installationIncomplete = true;

  if (installationIncomplete) {
    vscode.window.showErrorMessage('Compiler installation incomplete');
    return false;
  }

  return true;
}

function checkCompilersMac() {
  const userPath = '/usr/bin/';
  const globalPath = '/bin/';
  const localPath = '/usr/local/bin/';
  let installationIncomplete = false;

  const gccUserPath = path.join(userPath, 'clang');
  const gppUserPath = path.join(userPath, 'clang++');
  const gdbUserPath = path.join(userPath, 'lldb');
  const makeUserPath = path.join(userPath, 'make');

  const gccGlobalPath = path.join(globalPath, 'clang');
  const gppGlobalPath = path.join(globalPath, 'clang++');
  const gdbGlobalPath = path.join(globalPath, 'lldb');
  const makeGlobalPath = path.join(globalPath, 'make');

  const gccLocalPath = path.join(localPath, 'clang');
  const gppLocalPath = path.join(localPath, 'clang++');
  const gdbLocalPath = path.join(localPath, 'lldb');
  const makeLocalPath = path.join(localPath, 'make');

  if (
    !pathExists(gccUserPath) &&
    !pathExists(gccGlobalPath) &&
    !pathExists(gccLocalPath)
  )
    installationIncomplete = true;
  if (
    !pathExists(gppUserPath) &&
    !pathExists(gppGlobalPath) &&
    !pathExists(gppLocalPath)
  )
    installationIncomplete = true;
  if (
    !pathExists(gdbUserPath) &&
    !pathExists(gdbGlobalPath) &&
    !pathExists(gdbLocalPath)
  )
    installationIncomplete = true;
  if (
    !pathExists(makeUserPath) &&
    !pathExists(makeGlobalPath) &&
    !pathExists(makeLocalPath)
  )
    installationIncomplete = true;

  if (installationIncomplete) {
    vscode.window.showErrorMessage('Compiler installation incomplete');
    return false;
  }

  return true;
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
  data['tasks'][4]['args'][5] = 'C_COMPILER=${config:compilerCpp}';
  data['tasks'][4]['args'][6] = 'LANGUAGE_MODE=Cpp';

  data['tasks'][5]['label'] = data['tasks'][5]['label'].replace('C:', 'Cpp:');
  data['tasks'][5]['args'][5] = 'C_COMPILER=${config:compilerCpp}';
  data['tasks'][5]['args'][6] = 'LANGUAGE_MODE=Cpp';

  return data;
}
