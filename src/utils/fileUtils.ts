import * as fs from 'fs';
import * as JSON5 from 'json5';
import * as path from 'path';

export function replaceBackslashes(text: string) {
  return text.replace(/\\/g, '/');
}

export function mkdirRecursive(dir: string) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (err) {}
}

export function rmdirRecursive(dir: string) {
  try {
    fs.rmdirSync(dir, { recursive: true });
  } catch (err) {}
}

export function pathExists(filepath: string) {
  try {
    fs.accessSync(filepath);
  } catch (err) {
    return false;
  }

  return true;
}

export function readDir(dir: string | fs.PathLike) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    return undefined;
  }
}

export function readJsonFile(filepath: string) {
  let configJson: any | undefined;

  try {
    const fileContent = fs.readFileSync(filepath, 'utf-8');
    configJson = JSON5.parse(fileContent);
  } catch (err) {
    return undefined;
  }

  return configJson;
}

export function writeJsonFile(outputFilePath: string, jsonContent: any) {
  if (jsonContent === undefined) return;

  const dirname = path.dirname(outputFilePath);

  if (!pathExists(dirname)) {
    mkdirRecursive(dirname);
  }

  const jsonString = JSON.stringify(jsonContent, null, 2);

  try {
    fs.writeFileSync(outputFilePath, jsonString);
  } catch (err) {
    return;
  }
}
