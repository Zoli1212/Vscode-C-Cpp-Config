import {
	C_COMPILER_PATH,
	CPP_COMPILER_PATH,
	DEBUGGER_PATH,
	MAKE_PATH,
	OPERATING_SYSTEM,
} from './extension';
import { replaceBackslashes } from './utils/fileUtils';
import { OperatingSystems } from './utils/types';

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

export function removeFullEntries(data: { [key: string]: any }) {
  delete data['compilerC'];
  delete data['compilerCpp'];
  delete data['make'];

  return data;
}

export function replaceSettings(data: { [key: string]: any }) {
  data['compilerC'] = replaceValueBasedOnEnv(C_COMPILER_PATH);
  data['compilerCpp'] = replaceValueBasedOnEnv(CPP_COMPILER_PATH);
  data['make'] = replaceValueBasedOnEnv(MAKE_PATH);

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
