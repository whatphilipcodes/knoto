import { StateCreator, StoreApi } from 'zustand';
import { writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
//
import { loadState } from '../storeHelpers';

export const withPersistentStorage = <T extends object>(
  getFilePath: (get: () => T) => string | undefined,
  version = 0,
): ((config: StateCreator<T>) => StateCreator<T>) => {
  return (config) => {
    return (set, get, api) => {
      // We load the default state by calling config once
      const defaultState = config(() => {}, get, api);

      // Load and set state asynchronously
      (async () => {
        const filePath = getFilePath(get);
        if (filePath) {
          console.log('Loading state from file:', filePath);
          const savedState = await loadState<T>(filePath, defaultState);
          console.log('State loaded:', savedState);
          set(savedState);
        }
      })().catch(console.error);

      // Override 'set' to persist changes
      const customSet: typeof set = (nextState, replace) => {
        set(nextState, replace as false | undefined);
        const filePath = getFilePath(get);
        if (filePath) {
          console.log('Persisting state to file:', filePath);
          writeTextFile(filePath, JSON.stringify({ state: get(), version }), {
            baseDir: BaseDirectory.AppData,
          }).catch(console.error);
        }
      };

      // Return modded config
      return config(customSet, get, api as StoreApi<T>);
    };
  };
};
