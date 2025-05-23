import { readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

export const validateState = <T extends object>(
  loadedState: any, // JSON from disk
  defaultState: T,
): T => {
  if (typeof loadedState !== 'object' || loadedState === null) {
    console.warn('Invalid state format. Using default values.');
    return defaultState;
  }
  const filteredState = Object.keys(defaultState).reduce((acc, key) => {
    if (key in loadedState) {
      (acc as any)[key] = loadedState[key];
    } else if (typeof (defaultState as any)[key] !== 'function') {
      console.warn(`Missing property "${key}" in loaded state.`);
    }
    return acc;
  }, {} as T);

  return filteredState;
};

export const loadState = async <T extends object>(
  filePath: string,
  baseDir: BaseDirectory,
  defaultState: T,
): Promise<T> => {
  console.log('Loading State from file:', filePath);
  try {
    const data = JSON.parse(await readTextFile(filePath, { baseDir: baseDir }));
    if (!data?.state) {
      console.warn(`Invalid state structure in ${filePath}. Using default.`);
      return stripNonSerializable(defaultState);
    }
    console.log('State on disk:', data.state);
    const validPartial = validateState<T>(data.state, defaultState);
    return validPartial;
  } catch (error) {
    console.warn(`Failed to load state from ${filePath}`, error);
    return stripNonSerializable(defaultState);
  }
};

const stripNonSerializable = <T>(data: T): T => {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(stripNonSerializable) as unknown as T;
  }

  const result: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = (data as { [key: string]: any })[key];
      if (
        typeof value !== 'function' &&
        typeof value !== 'symbol' &&
        typeof value !== 'undefined'
      ) {
        result[key] = stripNonSerializable(value);
      }
    }
  }
  return result as T;
};
