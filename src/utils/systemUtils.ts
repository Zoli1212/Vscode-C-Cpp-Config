import { lookpath } from 'lookpath';
import { platform } from 'os';

import { OperatingSystems } from './types';

export async function commandExists(command: string) {
  let commandPath = await lookpath(command);

  if (!commandPath) {
    return { f: false, p: commandPath };
  }

  if (commandPath.includes('.EXE')) {
    commandPath = commandPath.replace('.EXE', '.exe');
  }

  return { f: true, p: commandPath };
}

export function getOperatingSystem() {
  const platformName = platform();
  let operatingSystem: OperatingSystems;

  if (platformName === 'win32') {
    operatingSystem = OperatingSystems.windows;
  } else if (platformName === 'darwin') {
    operatingSystem = OperatingSystems.mac;
  } else {
    operatingSystem = OperatingSystems.linux;
  }

  return operatingSystem;
}
