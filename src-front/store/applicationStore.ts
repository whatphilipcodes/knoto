import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
//
import { sep, BaseDirectory } from '@tauri-apps/api/path';
import { exists, mkdir } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';
//
import { ApiClient } from '../utils/api';
import { logger } from './middleware/logger';
import { withPersistentStorage } from './middleware/withPersistentStorage';

const defaultApplicationState = {
  backendPort: undefined as number | undefined,
  backendAPI: undefined as ApiClient | undefined,
  activeCollectionDir: undefined as string | undefined,
};

type ApplicationState = typeof defaultApplicationState & {
  openCollectionDir: () => Promise<void>;
};

// Create your stores using the typed middleware
export const useApplicationStore = create<ApplicationState>()(
  subscribeWithSelector(
    logger(
      withPersistentStorage<ApplicationState>(() => 'config.json')((set) => ({
        ...defaultApplicationState,
        openCollectionDir: async () => {
          const activeCollectionDir = await openCollectionDir();
          if (activeCollectionDir) set({ activeCollectionDir });
        },
      })),
    ),
  ),
);

const openCollectionDir = async () => {
  try {
    const root = await open({
      multiple: false,
      directory: true,
    });
    if (!root) return undefined;
    const noteSub = `${root}${sep()}notes`;
    if (!(await exists(noteSub, { baseDir: BaseDirectory.Home })))
      mkdir(noteSub, { baseDir: BaseDirectory.Home });
    return root;
  } catch (error) {
    console.log('An error occurred during openCollectionDir:', error);
  }
};
