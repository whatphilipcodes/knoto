import { StateCreator, StoreApi } from 'zustand';
import { writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { loadState } from '../storeHelpers';

export const withPersistentStorage = <T extends object>(
  getFilePath: (get: () => T) => string | undefined,
  include?: (keyof T)[],
  baseDir = BaseDirectory.AppData,
  version = 0,
): ((config: StateCreator<T>) => StateCreator<T>) => {
  return (config) => {
    return (set, get, api) => {
      // default state by calling config once
      let defaultState = config(() => {}, get, api);

      // initial load from disk
      (async () => {
        const filePath = getFilePath(get);
        if (filePath) {
          defaultState = filterIncluded(defaultState, include);
          console.log('Loading state from file:', filePath);
          const savedState = await loadState<T>(
            filePath,
            baseDir,
            defaultState,
          );
          console.log('State on disk:', savedState);
          set(savedState);
        }
      })().catch(console.error);

      const customSet: typeof set = (nextState, replace) => {
        set(nextState, replace as false | undefined);
        const filePath = getFilePath(get);
        if (filePath) {
          const state = filterIncluded(get(), include);
          console.log('Persisting state to file:', filePath);
          writeTextFile(filePath, JSON.stringify({ state, version }), {
            baseDir: baseDir,
          }).catch(console.error);
        }
      };

      return config(customSet, get, api as StoreApi<T>);
    };
  };
};

const filterIncluded = <T extends object>(
  state: T,
  include: (keyof T)[] | undefined,
): T => {
  if (!include) {
    return state;
  }
  return include.reduce<T>(
    (obj, key) => ({ ...obj, [key]: state[key] }),
    {} as T,
  );
};
