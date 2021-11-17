import { execSync } from 'child_process';
import { platform } from 'os';

import { OperatingSystems } from './types';

export function getOperatingSystem() {
  const platformName = platform();
  let OPERATING_SYSTEM: OperatingSystems;

  if (platformName === 'win32') {
    OPERATING_SYSTEM = OperatingSystems.windows;
  } else if (platformName === 'darwin') {
    OPERATING_SYSTEM = OperatingSystems.mac;
  } else {
    OPERATING_SYSTEM = OperatingSystems.linux;
  }

  return OPERATING_SYSTEM;
}

export function getCompilerArchitecture(compiler: string) {
  const command = `${compiler} -dumpmachine`;
  let byteArray: Buffer | undefined;

  try {
    byteArray = execSync(command);
  } catch (err) {
    byteArray = Buffer.from('x64', 'utf-8');
  }

  const str = String.fromCharCode(...byteArray);

  let isArmArchitecture: boolean = false;

  if (str.toLowerCase().includes('arm')) {
    isArmArchitecture = true;
  }

  return isArmArchitecture;
}
