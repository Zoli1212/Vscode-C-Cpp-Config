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

export function activate(context: vscode.context) {
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

function initgenerateCCommandDisposable(context: vscode.context) {
  if (generateCCommandDisposable) return;

  const CommanddName = `${EXTENSION_NAME}.generateConfigC`;
  generateCCommandDisposable = vscode.commands.registerCommand(
    CommanddName,
    async () => {
      const { templatePath, targetPath } = getFilepaths();
      if (!templatePath || !targetPath) return;

      mkdirRecursive(targetPath);

      FILES.forEach((filename) => {
        const targetFilename = path.join(targetPath, filename);
        const templateFilename = path.join(templatePath, filename);

        if (!pathExists(templateFilename)) return;

        const templateData = fs.readFileSync(templateFilename);
        fs.writeFileSync(targetFilename, templateData);
      });
    },
  );

  context?.subscriptions.push(generateCCommandDisposable);
}

function initgenerateCppCommandDisposable(context: vscode.context) {
  if (generateCppCommandDisposable) return;

  const CommanddName = `${EXTENSION_NAME}.generateConfigCpp`;
  generateCppCommandDisposable = vscode.commands.registerCommand(
    CommanddName,
    async () => {
      const { templatePath, targetPath } = getFilepaths();
      if (!templatePath || !targetPath) return;

      mkdirRecursive(targetPath);

      FILES.forEach((filename) => {
        const targetFilename = path.join(targetPath, filename);
        const templateFilename = path.join(templatePath, filename);

        if (!pathExists(templateFilename)) return;

        if (filename === 'launch.json') {
          const templateData: { [key: string]: string } = readJsonFile(
            templateFilename,
          );
          replaceLanguageLaunch(templateData);
          writeJsonFile(targetFilename, templateData);
        } else if (filename === 'tasks.json') {
          const templateData: { [key: string]: string } = readJsonFile(
            templateFilename,
          );
          replaceLanguageTasks(templateData);
          writeJsonFile(targetFilename, templateData);
        } else {
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

  const templatePath = path.join(extensionPath, 'templates', operatingSystem);
  const targetPath = path.join(workspaceFolder, '.vscode');

  return { templatePath, targetPath };
}

function replaceLanguageLaunch(data: { [key: string]: any }) {
  data['configurations'][0]['name'] = data['configurations'][0]['name'].replace(
    'C:',
    'Cpp:',
  );
  data['configurations'][0]['preLaunchTask'] = data['configurations'][0][
    'preLaunchTask'
  ].replace('C:', 'Cpp:');
}

function replaceLanguageTasks(data: { [key: string]: any }) {
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
}
