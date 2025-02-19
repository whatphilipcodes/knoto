import { create } from 'zustand';
//
import { BaseDirectory, sep } from '@tauri-apps/api/path';
//
import { logger } from './middleware/logger';
import { loadState } from './storeHelpers';
import { withPersistentStorage } from './middleware/withPersistentStorage';
import { useApplicationStore } from './applicationStore';

const defaultCollectionState = {
  collectionDirRoot: undefined as string | undefined,
  collectionDirStore: undefined as string | undefined,
  testValue: 'test',
};

type CollectionState = typeof defaultCollectionState & {
  // setDirs: (newRoot: string) => void;
  test: (val: string) => void;
};

export const useCollectionStore = create<CollectionState>()(
  logger(
    withPersistentStorage<CollectionState>((get) => {
      const state = get();
      return state ? state.collectionDirStore : undefined;
    })((set) => ({
      ...defaultCollectionState,
      // setDirs: (newRoot) => {
      //   set();
      // },
      test: (testValue) => {
        set({ testValue });
      },
      // idea: data as map: metadata -> filepath ! content loaded on opening
    })),
  ),
);

const getCollectionDirs = (root: string) => {
  return {
    collectionDirRoot: root,
    collectionDirStore: `${root}${sep()}collection-data.json` || undefined,
  };
};

export const subscribeColToApp = () => {
  // Reload CollectionStore when activeCollectionDir changes
  return useApplicationStore.subscribe(
    (state) => state.activeCollectionDir,
    async (newDir) => {
      console.log('subscribe fired', newDir);
      if (!newDir) return;
      const merged = {
        ...useCollectionStore.getInitialState(),
        ...getCollectionDirs(newDir),
      };
      console.log('! merged fallback state after subscribe', merged);
      if (!merged.collectionDirStore) return;
      await loadState<CollectionState>(
        merged.collectionDirStore,
        BaseDirectory.Home,
        merged,
      ).then((newState) => useCollectionStore.setState(newState));
    },
    { fireImmediately: false },
  );
};
