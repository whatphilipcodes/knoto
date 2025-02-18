import { create } from 'zustand';
//
import { logger } from './middleware/logger';
import { loadState } from './storeHelpers';
import { withPersistentStorage } from './middleware/withPersistentStorage';
import { useApplicationStore } from './applicationStore';

interface CollectionState {
  collectionDir: string | undefined;
}

export const useCollectionStore = create<CollectionState>()(
  logger(
    withPersistentStorage<CollectionState>((get) => {
      const state = get();
      return state ? state.collectionDir : undefined;
    })((set) => ({
      collectionDir: undefined,
    })),
  ),
);

export const initColSubToApp = () => {
  // Auto-update User Store when the File Path Changes
  return useApplicationStore.subscribe(
    (state) => state.activeCollectionDir,
    (newDir) => {
      if (!newDir) return;
      console.log('subscription detected new dir:', newDir);
      loadState<CollectionState>(newDir, { collectionDir: newDir }).then(
        // to-do: handle empty state from load (config found, containing no collectionDir)
        (newState) => useCollectionStore.setState(newState),
      );
    },
    { fireImmediately: false },
  );
};
