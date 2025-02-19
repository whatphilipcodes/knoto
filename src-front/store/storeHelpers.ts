import {
  mkdir,
  readTextFile,
  BaseDirectory,
  exists,
} from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';

/**
 * Validates the loaded state object by filtering out any properties that are not defined in the default state.
 * If a property in the default state is missing in the loaded state, a warning is logged and the default value is used.
 *
 * @typeParam T - The type of the state object.
 * @param loadedState - The state object loaded from disk (usually parsed from JSON).
 * @param defaultState - The default state object containing all expected properties.
 * @returns A new state object of type T that includes only properties defined in the default state.
 */
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

/**
 * Loads a state from a JSON file and validates its structure.
 * This function reads the content of the specified file, attempts to parse it as JSON, and then verifies the presence
 * of a "state" property. If the file cannot be read, parsed, or if the state structure is invalid, the provided default
 * state is returned.
 *
 * @template T - The type representing the state object.
 * @param filePath - The relative path to the file containing the state JSON.
 * @param baseDir - The base directory relative to which the filePath should be resolved.
 * @param defaultState - The default state object to return if loading or validation fails.
 * @returns A Promise that resolves to a validated state object of type T.
 */
export const loadState = async <T extends object>(
  filePath: string,
  baseDir: BaseDirectory,
  defaultState: T,
): Promise<T> => {
  try {
    const data = JSON.parse(await readTextFile(filePath, { baseDir: baseDir }));
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

export const ensureAppData = async () => {
  const dir = await appDataDir();
  if (await exists(dir)) {
    console.log('config dir available:', dir);
    return;
  } else {
    console.log('config dir has to be created');
    await mkdir(dir);
    console.log('config dir created at:', dir);
  }
};
