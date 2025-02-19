import { create } from 'zustand';
import { BaseDirectory } from '@tauri-apps/api/path';
//
import { logger } from './middleware/logger';
import { loadState } from './storeHelpers';
import { withPersistentStorage } from './middleware/withPersistentStorage';
import { useApplicationStore } from './applicationStore';

const defaultCollectionState = {
  collectionRoot: undefined as string | undefined,
  testValue: 'test',
};

type CollectionState = typeof defaultCollectionState & {
  setTestValue: (newValue: string) => void;
  reset: () => void;
};

export const useCollectionStore = create<CollectionState>()(
  logger(
    withPersistentStorage<CollectionState>((get) => {
      const state = get();
      return state ? state.collectionRoot : undefined;
    })((set) => ({
      ...defaultCollectionState,
      setTestValue: (testValue) => set({ testValue }),
      reset: () => set(defaultCollectionState),
      // idea: data as map: metadata -> filepath ! content loaded on opening
    })),
  ),
);

export const initColSubToApp = () => {
  // Reload CollectionStore when activeCollectionDir changes
  return useApplicationStore.subscribe(
    (state) => state.activeCollectionDir,
    async (newDir) => {
      if (!newDir) return;
      console.log('subscription detected new dir:', newDir);
      useCollectionStore.getState().reset();
      useCollectionStore.setState({ collectionRoot: newDir });
      await loadState<CollectionState>(
        newDir,
        BaseDirectory.Home,
        useCollectionStore.getState(),
      ).then((newState) => useCollectionStore.setState(newState));
    },
    { fireImmediately: false },
  );
};
