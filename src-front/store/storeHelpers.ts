import { readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

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
    } else {
      console.warn(`Missing property "${key}" in loaded state. Using default.`);
    }
    return acc;
  }, {} as T);

  return filteredState;
};

/**
 * Loads a state from a file and validates its structure.
 * This function attempts to parse JSON data from the specified file, validates its format,
 * and returns a valid state object. If the file cannot be read, parsed, or if the JSON structure
 * does not match the expected format, the provided default state is returned.
 *
 * @typeParam T - The type of the state object.
 * @param filePath - The relative path to the file containing the state JSON.
 * @param defaultState - The default state object to use if loading or validation fails.
 * @returns A promise resolving to the validated state object of type T.
 */
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
