import { StateCreator, StoreApi } from 'zustand';
import { writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
//
import { loadState } from '../storeHelpers';

/**
 * Enhances a Zustand state creator with persistent storage functionality.
 *
 * This higher-order function wraps the provided state creator so that:
 * - It first loads the persisted state (if available) from the file specified by `getFilePath`
 *   and sets it as the current state.
 * - It intercepts state updates (via the `set` function) and writes the new state to disk,
 *   ensuring persistence.
 *
 * @template T - The shape of the state object.
 * @param getFilePath - A function that accepts the current state getter and returns
 *                      the file path where the state should be persisted. If undefined,
 *                      persistence is disabled.
 * @param version - The version number of the persisted state, useful for managing state migrations.
 *                  Defaults to 0.
 * @returns A function that accepts a standard Zustand state creator and returns an enhanced state creator
 *          with persistent storage capabilities.
 */
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

      /**
       * Overrides the standard 'set' method to persist state changes to disk.
       *
       * @param nextState - The new state or partial update for the state.
       * @param replace - If true, replaces the current state entirely instead of merging.
       */
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

      // Return the enhanced configuration by passing in the custom set method.
      return config(customSet, get, api as StoreApi<T>);
    };
  };
};
