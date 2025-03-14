import { StateCreator, StoreMutatorIdentifier } from 'zustand';

/**
 * Logger is a higher-order function that wraps a Zustand state creator function
 * to log state changes whenever the `set` or `setState` functions are called.
 *
 * @template T - The type of the state.
 * @template Mps - The list of store mutators for `set`.
 * @template Mcs - The list of store mutators for `setState`.
 * @param f - The original state creator function.
 * @param name - Optional name to prepend to log messages.
 * @returns A new state creator function that logs state changes.
 */
type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string,
) => StateCreator<T, Mps, Mcs>;

/**
 * LoggerImpl is a specialized version of Logger for state creators without mutators.
 *
 * @template T - The type of the state.
 * @param f - The original state creator function.
 * @param name - Optional name to prepend to log messages.
 * @returns A new state creator function that logs state changes.
 */
type LoggerImpl = <T>(
  f: StateCreator<T, [], []>,
  name?: string,
) => StateCreator<T, [], []>;

/**
 * Implements a logger that wraps the `set` and `setState` functions of a Zustand store
 * to add logging of the state after updates.
 *
 * @template T - The type of the state.
 * @param f - The original state creator function.
 * @param name - Optional name to prepend to log messages.
 * @returns A state creator function with logging enabled.
 */
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

/**
 * A logger function that wraps a Zustand state creator to log state changes.
 *
 * This is the exported logger function intended for use with Zustand stores.
 */
export const logger = loggerImpl as unknown as Logger;
