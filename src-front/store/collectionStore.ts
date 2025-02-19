import { create } from 'zustand';
//
import { BaseDirectory, sep } from '@tauri-apps/api/path';
import { exists, mkdir } from '@tauri-apps/plugin-fs';
//
import { logger } from './middleware/logger';
import { loadState } from './storeHelpers';
import { withPersistentStorage } from './middleware/withPersistentStorage';
import { useApplicationStore } from './applicationStore';

const defaultCollectionState = {
  collectionDirRoot: undefined as string | undefined,
  collectionSubdirNotes: 'notes',
  collectionStoreName: 'collection-data.json',
  testValue: 'test',
};

type CollectionState = typeof defaultCollectionState & {
  test: (val: string) => void;
};

export const useCollectionStore = create<CollectionState>()(
  logger(
    withPersistentStorage<CollectionState>((get) => {
      const state = get();
      return state?.collectionDirRoot
        ? `${state.collectionDirRoot}${sep()}${state.collectionStoreName}`
        : undefined;
    })((set) => ({
      ...defaultCollectionState,
      test: (testValue) => {
        set({ testValue });
      },
      // idea: data as map: metadata -> filepath ! content loaded on opening
    })),
  ),
);

// to-do: unsub return is slower than react strict reload
export const subscribeColToApp = () => {
  // Reload CollectionStore when activeCollectionDir changes
  return useApplicationStore.subscribe(
    (state) => state.activeCollectionDir,
    async (newDir) => {
      if (!newDir) return;
      const merged = {
        ...useCollectionStore.getInitialState(),
        collectionDirRoot: newDir,
      };
      await initCollectionDir(merged);
      await loadState<CollectionState>(
        `${merged.collectionDirRoot}${sep()}${merged.collectionStoreName}`,
        BaseDirectory.Home,
        merged,
      ).then((newState) => useCollectionStore.setState(newState));
    },
    { fireImmediately: true },
  );
};

const initCollectionDir = async (state: CollectionState) => {
  const noteSub = `${state.collectionDirRoot}${sep()}${state.collectionSubdirNotes}`;
  if (!(await exists(noteSub, { baseDir: BaseDirectory.Home })))
    mkdir(noteSub, { baseDir: BaseDirectory.Home });
};
