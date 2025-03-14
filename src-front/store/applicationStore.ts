import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';
import { emit } from '@tauri-apps/api/event';
import { withPersistentStorage } from './middleware/withPersistentStorage';
import { logger } from './middleware/logger';
import { openDir, getAppConfigDir } from '../utils/filesystem';
import { ApiClient } from '../utils/api';

const defaultApplicationState = {
  backendAPI: null as ApiClient | null,
  backendPort: null as number | null,
  appConfigDir: null as string | null,
  activeAtlasDir: null as string | null,
};

type ApplicationState = typeof defaultApplicationState & {
  initAppConfigDir: () => Promise<void>;
  initBackendAPI: () => Promise<void>;
  openAtlasDir: () => Promise<void>;
};

// Create your stores using the typed middleware
export const useApplicationStore = create<ApplicationState>()(
  subscribeWithSelector(
    logger(
      withPersistentStorage<ApplicationState>(
        () => 'config.json',
        ['activeAtlasDir'],
      )((set, get) => ({
        ...defaultApplicationState,
        initAppConfigDir: async () => {
          if (get().appConfigDir) return;
          const appConfigDir = await getAppConfigDir();
          set({ appConfigDir });
        },
        initBackendAPI: async () => {
          const backendPort = await invoke<number>('get_port');
          const api = new ApiClient('http', 'localhost', backendPort);
          if (await api.connect()) {
            set({
              backendPort,
              backendAPI: api,
            });
          } else {
            throw new Error('Could not connect to backendAPI');
          }
        },
        openAtlasDir: async () => {
          const activeAtlasDir = await openDir();
          if (activeAtlasDir) {
            set({ activeAtlasDir });
            await emit('fs:atlas-load');
          }
        },
      })),
    ),
  ),
);
