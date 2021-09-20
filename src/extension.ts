import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { copyFileSync, mkdirRecursive, pathExists } from './utils/fileUtils';
import { getOperatingSystem } from './utils/systemUtils';
import { OperatingSystems } from './utils/types';
import { disposeItem } from './utils/vscodeUtils';

let generateCommandDisposable: vscode.Disposable | undefined;
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

  initGenerateCommandDisposable(context);
}

export function deactivate() {
  disposeItem(generateCommandDisposable);
}

function initGenerateCommandDisposable(context: vscode.context) {
  if (generateCommandDisposable) return;

  const commandName = `${EXTENSION_NAME}.generateConfig`;
  generateCommandDisposable = vscode.commands.registerCommand(
    commandName,
    async () => {
      const operatingSystem = getOperatingSystem();

      if (!extensionPath || !workspaceFolder) return;

      const templatePath = path.join(
        extensionPath,
        'templates',
        operatingSystem,
      );
      const targetPath = path.join(workspaceFolder, '.vscode');

      mkdirRecursive(targetPath);

      FILES.forEach((filename) => {
        const targetFileneme = path.join(targetPath, filename);
        const templateFileneme = path.join(templatePath, filename);

        if (!pathExists(templateFileneme)) return;

        const templateData = fs.readFileSync(templateFileneme);
        fs.writeFileSync(targetFileneme, templateData);
      });
    },
  );

  context?.subscriptions.push(generateCommandDisposable);
}
