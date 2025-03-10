import { create } from 'zustand';
//
import { BaseDirectory, sep } from '@tauri-apps/api/path';
import { exists, mkdir } from '@tauri-apps/plugin-fs';
import { emit } from '@tauri-apps/api/event';
//
import { logger } from './middleware/logger';
import { loadState } from './storeHelpers';
import { withPersistentStorage } from './middleware/withPersistentStorage';
import { useApplicationStore } from './applicationStore';
import { AtlasData } from '../utils/types';
import { Node } from '../utils/types';

const defaultAtlasState = {
  atlasRootDir: undefined as string | undefined,
  atlasSubdirNotes: 'notes',
  atlasStoreName: 'atlas-config.json',
  atlasDatabaseName: 'atlas.db',
  nodes: [] as Node[],
};

type AtlasState = typeof defaultAtlasState & {
  setFullState: (newState: Omit<AtlasState, 'setFullState'>) => void;
  updateBackend: () => Promise<void>;
  updateNodes: () => Promise<void>;
};

export const useAtlasStore = create<AtlasState>()(
  logger(
    withPersistentStorage<AtlasState>(
      (get) => {
        const state = get();
        return state?.atlasRootDir
          ? `${state.atlasRootDir}${sep()}${state.atlasStoreName}`
          : undefined;
      },
      [
        'atlasRootDir',
        'atlasSubdirNotes',
        'atlasStoreName',
        'atlasDatabaseName',
      ],
    )((set, get) => ({
      ...defaultAtlasState,
      setFullState: (newState) => {
        set(newState);
      },
      updateBackend: async () => {
        const atlas = get();
        const api = useApplicationStore.getState().backendAPI;
        if (!atlas.atlasRootDir)
          throw new Error('no atlasRootDir set in atlas store');
        const data: AtlasData = {
          root: atlas.atlasRootDir,
          id_database: atlas.atlasDatabaseName,
        };
        await api?.post('/api/v1/set-atlas', data);
      },
      updateNodes: async () => {
        const api = useApplicationStore.getState().backendAPI;
        await api?.get('/api/v1/get-all-nodes').then((data) => {
          const nodes: Node[] = data.nodes;
          set({ nodes });
        });
      },
    })),
  ),
);

// to-do: unsub return is slower than react strict reload
export const subscribeColToApp = () => {
  // Reload AtlasStore when activeAtlasDir changes
  return useApplicationStore.subscribe(
    (state) => state.activeAtlasDir,
    async (newRoot) => {
      if (!newRoot) return;
      const newAtlas = await updateAtlasStore(newRoot);
      await newAtlas.updateBackend();
      await newAtlas.updateNodes();
    },
    { fireImmediately: true },
  );
};

const initAtlasDir = async (state: AtlasState) => {
  const noteSub = `${state.atlasRootDir}${sep()}${state.atlasSubdirNotes}`;
  try {
    if (!(await exists(noteSub, { baseDir: BaseDirectory.Home })))
      await mkdir(noteSub, { baseDir: BaseDirectory.Home });
  } catch (error) {
    await emit('fs:atlas-error');
  }
};

const updateAtlasStore = async (newRoot: string): Promise<AtlasState> => {
  const merged = {
    ...useAtlasStore.getInitialState(),
    atlasRootDir: newRoot,
  };
  await initAtlasDir(merged);
  await loadState<AtlasState>(
    `${merged.atlasRootDir}${sep()}${merged.atlasStoreName}`,
    BaseDirectory.Home,
    merged,
  ).then((newState) => useAtlasStore.getState().setFullState(newState));
  return useAtlasStore.getState();
};
