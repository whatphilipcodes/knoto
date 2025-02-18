import { StateCreator, StoreMutatorIdentifier } from 'zustand';

// Define a type for the Logger function which takes a StateCreator and an optional name,
// and returns a StateCreator. The StateCreator can have additional mutator parameters (Mps) and mutator creators (Mcs).
type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string,
) => StateCreator<T, Mps, Mcs>;

// Define a type for the Logger implementation which takes a StateCreator and an optional name,
// and returns a StateCreator. This implementation does not use additional mutator parameters or creators.
type LoggerImpl = <T>(
  f: StateCreator<T, [], []>,
  name?: string,
) => StateCreator<T, [], []>;

// Implement the logger function which wraps the set and setState functions to log their actions.
const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
  // Wrap the set function to log the state after it is updated.
  const loggedSet: typeof set = (...a) => {
    set(...(a as Parameters<typeof set>));
    console.log(...(name ? [`${name}:`] : []), get());
  };

  // Wrap the setState function to log the state after it is updated.
  const setState = store.setState;
  store.setState = (...a) => {
    setState(...(a as Parameters<typeof setState>));
    console.log(...(name ? [`${name}:`] : []), store.getState());
  };

  // Return the original StateCreator with the wrapped set and setState functions.
  return f(loggedSet, get, store);
};

// Export the logger function, casting it to the Logger type.
export const logger = loggerImpl as unknown as Logger;
