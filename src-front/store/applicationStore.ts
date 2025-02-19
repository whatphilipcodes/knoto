import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
//
import { invoke } from '@tauri-apps/api/core';
//
import { ApiClient } from '../utils/api';
import { logger } from './middleware/logger';
import { openDir } from '../utils/filesystem';
import { withPersistentStorage } from './middleware/withPersistentStorage';

const defaultApplicationState = {
  backendPort: undefined as number | undefined,
  backendAPI: undefined as ApiClient | undefined,
  activeCollectionDir: undefined as string | undefined,
};

type ApplicationState = typeof defaultApplicationState & {
  initBackendAPI: () => Promise<void>;
  openCollectionDir: () => Promise<void>;
};

// Create your stores using the typed middleware
export const useApplicationStore = create<ApplicationState>()(
  subscribeWithSelector(
    logger(
      withPersistentStorage<ApplicationState>(() => 'config.json')((set) => ({
        ...defaultApplicationState,
        initBackendAPI: async () => {
          console.log('hello from init api');
          const backendPort = await invoke<number>('get_port');
          console.log(backendPort);
          set({
            backendPort,
            backendAPI: new ApiClient('http', 'localhost', backendPort),
          });
          console.log('set ran');
        },
        openCollectionDir: async () => {
          const activeCollectionDir = await openDir();
          if (activeCollectionDir) set({ activeCollectionDir });
        },
      })),
    ),
  ),
);
