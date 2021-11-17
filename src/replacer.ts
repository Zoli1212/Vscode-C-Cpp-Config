import * as path from 'path';

import {
	C_COMPILER_PATH,
	CPP_COMPILER_PATH,
	DEBUGGER_PATH,
	EXTENSION_NAME,
	MAKE_PATH,
	OPERATING_SYSTEM,
	WORKSPACE_FOLDER,
} from './extension';
import {
	readJsonFile,
	replaceBackslashes,
	writeJsonFile,
} from './utils/fileUtils';
import { JsonSettings, OperatingSystems } from './utils/types';

export function replaceLanguageLaunch(data: { [key: string]: any }) {
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

export function replaceLanguageTasks(data: { [key: string]: any }) {
  data['tasks'][0]['args'][4] =
    'CPP_COMPILER=${config:C_Cpp_Config.cppCompilerPath}';
  data['tasks'][0]['args'][5] = 'LANGUAGE_MODE=Cpp';

  data['tasks'][1]['args'][4] =
    'CPP_COMPILER=${config:C_Cpp_Config.cppCompilerPath}';
  data['tasks'][1]['args'][5] = 'LANGUAGE_MODE=Cpp';

  data['tasks'][2]['label'] = data['tasks'][2]['label'].replace('C:', 'Cpp:');
  data['tasks'][2]['args'][5] =
    'CPP_COMPILER=${config:C_Cpp_Config.cppCompilerPath}';
  data['tasks'][2]['args'][6] = 'LANGUAGE_MODE=Cpp';

  data['tasks'][3]['label'] = data['tasks'][3]['label'].replace('C:', 'Cpp:');
  data['tasks'][3]['args'][5] =
    'CPP_COMPILER=${config:C_Cpp_Config.cppCompilerPath}';
  data['tasks'][3]['args'][6] = 'LANGUAGE_MODE=Cpp';

  data['tasks'][4]['label'] = data['tasks'][4]['label'].replace('C:', 'Cpp:');
  data['tasks'][5]['label'] = data['tasks'][5]['label'].replace('C:', 'Cpp:');

  return data;
}

export function removeFullEntries(data: { [key: string]: any }) {
  delete data[`${EXTENSION_NAME}.cCompilerPath`];
  delete data[`${EXTENSION_NAME}.cppCompilerPath`];
  delete data[`${EXTENSION_NAME}.debuggerPath`];
  delete data[`${EXTENSION_NAME}.makePath`];

  return data;
}

export function replaceSettings(data: { [key: string]: any }) {
  data[`${EXTENSION_NAME}.cCompilerPath`] = replaceValueBasedOnEnv(
    C_COMPILER_PATH,
  );
  data[`${EXTENSION_NAME}.cppCompilerPath`] = replaceValueBasedOnEnv(
    CPP_COMPILER_PATH,
  );
  data[`${EXTENSION_NAME}.debuggerPath`] = replaceValueBasedOnEnv(
    DEBUGGER_PATH,
  );
  data[`${EXTENSION_NAME}.makePath`] = replaceValueBasedOnEnv(MAKE_PATH);

  return data;
}

export function replaceLaunch(data: { [key: string]: any }) {
  data['configurations'][0]['miDebuggerPath'] = replaceValueBasedOnEnv(
    DEBUGGER_PATH,
  );
  data['configurations'][1]['miDebuggerPath'] = replaceValueBasedOnEnv(
    DEBUGGER_PATH,
  );

  return data;
}

export function replaceProperties(data: { [key: string]: any }) {
  data['configurations'][0]['compilerPath'] = replaceValueBasedOnEnv(
    C_COMPILER_PATH,
  );

  return data;
}

export function replaceValueBasedOnEnv(path: string) {
  if (OPERATING_SYSTEM === OperatingSystems.windows) {
    path = replaceBackslashes(path);
  }

  return path;
}

export function updateSetting() {
  if (!WORKSPACE_FOLDER) return;

  const settingsPath = path.join(WORKSPACE_FOLDER, '.vscode', 'settings.json');

  let settingsJson: JsonSettings | undefined = readJsonFile(settingsPath);

  if (!settingsJson) settingsJson = {};

  settingsJson[`${EXTENSION_NAME}.cCompilerPath`] = C_COMPILER_PATH;
  settingsJson[`${EXTENSION_NAME}.cppCompilerPath`] = CPP_COMPILER_PATH;
  settingsJson[`${EXTENSION_NAME}.debuggerPath`] = DEBUGGER_PATH;
  settingsJson[`${EXTENSION_NAME}.makePath`] = MAKE_PATH;

  writeJsonFile(settingsPath, settingsJson);
}
