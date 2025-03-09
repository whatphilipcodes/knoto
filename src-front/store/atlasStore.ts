import { create } from 'zustand';
//
import { BaseDirectory, sep } from '@tauri-apps/api/path';
import { exists, mkdir } from '@tauri-apps/plugin-fs';
//
import { logger } from './middleware/logger';
import { loadState } from './storeHelpers';
import { withPersistentStorage } from './middleware/withPersistentStorage';
import { useApplicationStore } from './applicationStore';

const defaultAtlasState = {
  atlasDirRoot: undefined as string | undefined,
  atlasSubdirNotes: 'notes',
  atlasStoreName: 'atlas-data.json',
  atlasDatabaseName: 'atlas.db',
};

type AtlasState = typeof defaultAtlasState & {
  // test: (val: string) => void;
};

export const useAtlasStore = create<AtlasState>()(
  logger(
    withPersistentStorage<AtlasState>((get) => {
      const state = get();
      return state?.atlasDirRoot
        ? `${state.atlasDirRoot}${sep()}${state.atlasStoreName}`
        : undefined;
    })((_set) => ({
      ...defaultAtlasState,
      // test: (atlasDatabaseName) => {
      //   set({ atlasDatabaseName });
      // },
    })),
  ),
);

// to-do: unsub return is slower than react strict reload
export const subscribeColToApp = () => {
  // Reload AtlasStore when activeAtlasDir changes
  return useApplicationStore.subscribe(
    (state) => state.activeAtlasDir,
    async (newDir) => {
      if (!newDir) return;
      const merged = {
        ...useAtlasStore.getInitialState(),
        atlasDirRoot: newDir,
      };
      await initAtlasDir(merged);
      await loadState<AtlasState>(
        `${merged.atlasDirRoot}${sep()}${merged.atlasStoreName}`,
        BaseDirectory.Home,
        merged,
      ).then((newState) => useAtlasStore.setState(newState));
    },
    { fireImmediately: true },
  );
};

const initAtlasDir = async (state: AtlasState) => {
  const noteSub = `${state.atlasDirRoot}${sep()}${state.atlasSubdirNotes}`;
  if (!(await exists(noteSub, { baseDir: BaseDirectory.Home })))
    mkdir(noteSub, { baseDir: BaseDirectory.Home });
};
