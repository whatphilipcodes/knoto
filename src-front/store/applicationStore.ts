import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
//
import { invoke } from '@tauri-apps/api/core';
//
import { withPersistentStorage } from './middleware/withPersistentStorage';
import { logger } from './middleware/logger';
import { openDir, getAppConfigDir } from '../utils/filesystem';
import { ApiClient } from '../utils/api';

const defaultApplicationState = {
  backendPort: undefined as number | undefined,
  backendAPI: undefined as ApiClient | undefined,
  appConfigDir: undefined as string | undefined,
  activeCollectionDir: undefined as string | undefined,
};

type ApplicationState = typeof defaultApplicationState & {
  initAppConfigDir: () => Promise<void>;
  initBackendAPI: () => Promise<void>;
  openCollectionDir: () => Promise<void>;
};

// Create your stores using the typed middleware
export const useApplicationStore = create<ApplicationState>()(
  subscribeWithSelector(
    logger(
      withPersistentStorage<ApplicationState>(
        () => 'config.json',
        ['activeCollectionDir'],
      )((set, get) => ({
        ...defaultApplicationState,
        initAppConfigDir: async () => {
          if (get().appConfigDir) return;
          const appConfigDir = await getAppConfigDir();
          set({ appConfigDir });
        },
        initBackendAPI: async () => {
          const backendPort = await invoke<number>('get_port');
          set({
            backendPort,
            backendAPI: new ApiClient('http', 'localhost', backendPort),
          });
        },
        openCollectionDir: async () => {
          const activeCollectionDir = await openDir();
          if (activeCollectionDir) set({ activeCollectionDir });
        },
      })),
    ),
  ),
);
