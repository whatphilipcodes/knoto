import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';
import { emit } from '@tauri-apps/api/event';
import { withPersistentStorage } from './middleware/withPersistentStorage';
import { logger } from './middleware/logger';
import { openDir, getAppDirs } from '../utils/filesystem';
import { ApiClient } from '../utils/api';
import { AppData } from '../utils/types';

const defaultApplicationState = {
  appDataDir: null as string | null,
  backendAPI: null as ApiClient | null,
  backendPort: null as number | null,
  appConfigDir: null as string | null,
  activeAtlasDir: null as string | null,
};

type ApplicationState = typeof defaultApplicationState & {
  initAppDirs: () => Promise<void>;
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
        initAppDirs: async () => {
          if (get().appConfigDir && get().appDataDir) return;
          const [appConfigDir, appDataDir] = await getAppDirs();
          set({ appConfigDir, appDataDir });
        },
        initBackendAPI: async () => {
          const backendPort = await invoke<number>('get_port');
          const api = new ApiClient('http', 'localhost', backendPort);
          if (await api.connect()) {
            set({
              backendPort,
              backendAPI: api,
            });
            const dir_config = get().appConfigDir;
            const dir_data = get().appDataDir;
            if (!dir_config || !dir_data)
              throw new Error(
                'backend initialization failed, config or data dir are not set',
              );
            const data: AppData = {
              app_dir_config: dir_config,
              app_dir_data: dir_data,
            };
            await api.post('/api/v1/set-app', data);
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
