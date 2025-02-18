import { readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

export const validateState = <T extends object>(
  loadedState: any, // JSON from disk
  defaultState: T,
): T => {
  if (typeof loadedState !== 'object' || loadedState === null) {
    console.warn('Invalid state format. Using default values.');
    return defaultState;
  }

  // Filter out properties that are not in defaultState
  const filteredState = Object.keys(defaultState).reduce((acc, key) => {
    if (key in loadedState) {
      (acc as any)[key] = loadedState[key];
    } else {
      console.warn(`Missing property "${key}" in loaded state. Using default.`);
    }
    return acc;
  }, {} as T);

  return filteredState;
};

export const loadState = async <T extends object>(
  filePath: string,
  defaultState: T,
): Promise<T> => {
  try {
    const data = JSON.parse(
      await readTextFile(filePath, { baseDir: BaseDirectory.AppData }),
    );
    if (!data?.state) {
      console.warn(`Invalid state structure in ${filePath}. Using default.`);
      return defaultState;
    }
    const validPartial = validateState<T>(data.state, defaultState);
    return validPartial;
  } catch (error) {
    console.warn(`Failed to load state from ${filePath}`, error);
    return defaultState;
  }
};
