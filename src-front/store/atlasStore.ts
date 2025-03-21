import { create } from 'zustand';
import { BaseDirectory, sep } from '@tauri-apps/api/path';
import { exists, mkdir } from '@tauri-apps/plugin-fs';
import { logger } from './middleware/logger';
import { loadState } from './storeHelpers';
import { withPersistentStorage } from './middleware/withPersistentStorage';
import { useApplicationStore } from './applicationStore';
import { AtlasData, NodeData, NewNodeData } from '../utils/types';

const defaultAtlasState = {
  atlasRootDir: null as string | null,
  atlasSubdirNotes: 'notes',
  atlasStoreName: 'atlas-config.json',
  atlasDatabaseName: 'atlas.db',
  nodes: null as NodeData[] | null,
  activeNode: null as NodeData | null,
};

export type AtlasState = typeof defaultAtlasState & {
  setFullState: (newState: AtlasState) => void;
  updateBackend: () => Promise<void>;
  addNode: (node: Partial<NodeData>, content: string) => Promise<NodeData>;
  removeNode: (node: NodeData) => Promise<void>;
  updateNode: (updated: NodeData) => Promise<NodeData>;
  getAllNodes: () => Promise<void>;
  setActiveNode: (activeNode: NodeData | null) => void;
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
        'activeNode',
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
          subdir_nodes: atlas.atlasSubdirNotes,
          id_database: atlas.atlasDatabaseName,
        };
        await api?.post('/api/v1/set-atlas', data);
      },
      addNode: async (active, content) => {
        const api = useApplicationStore.getState().backendAPI;
        const newNode: NewNodeData = {
          node: active,
          content: content,
        };
        const addedNodes = await api
          ?.post('/api/v1/add-nodes', newNode)
          .then((data: { new: NodeData[] }) => {
            if (!data.new)
              throw new Error('backend did not respond with NodeData');
            let nodes = get().nodes;
            if (!nodes)
              throw new Error(
                'tried to add nodes despite atlas nodes being uninitialized',
              );
            nodes.push(...data.new);
            set({ nodes });
            return data.new;
          });
        if (!addedNodes) throw new Error(`node: ${active} could not be added`);
        return addedNodes[0]; // to-do: generalize to n nodes
      },
      removeNode: async (active: NodeData) => {
        const api = useApplicationStore.getState().backendAPI;
        let nodes = get().nodes;
        if (!nodes)
          throw new Error(
            'tried to update nodes even though no nodes are loaded in',
          );
        nodes = nodes.filter((node) => node.filepath !== active.filepath);
        await api
          ?.delete(`/api/v1/nodes/${active.filepath}`)
          .then((_response) => {
            // to-do fix api typing
            // if (!(response.status === 200))
            //   throw new Error(
            //     'during deletion the backend encountered a problem',
            //   );
          });
        set({ nodes });
      },
      updateNode: async (updated: NodeData) => {
        const current = get().activeNode;
        if (!current) throw new Error('no active node found');
        const api = useApplicationStore.getState().backendAPI;
        const completed = await api
          ?.post('/api/v1/update-node', { current, updated })
          .then((data: { new: NodeData }) => {
            let nodes = get().nodes;
            if (!nodes)
              throw new Error(
                'tried to update nodes even though no nodes are loaded in',
              );
            nodes = nodes.map((node) =>
              node.filepath === current?.filepath ? data.new : node,
            );
            set({ nodes });
            return data.new;
          });
        if (!completed)
          throw new Error(`node: ${updated} could not be updated`);
        return completed;
      },
      getAllNodes: async () => {
        const api = useApplicationStore.getState().backendAPI;
        await api?.get('/api/v1/get-all-nodes').then((data) => {
          const nodes: NodeData[] = data.nodes;
          set({ nodes });
        });
      },
      setActiveNode: (activeNode: NodeData | null) => {
        set({ activeNode });
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
      await newAtlas.getAllNodes();
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
    // await emit('fs:atlas-error'); // shows when creating new store
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
  ).then((newState) => {
    const clearNodes: AtlasState = {
      ...newState,
      nodes: null,
    };
    useAtlasStore.setState(clearNodes);
  });
  return useAtlasStore.getState();
};
