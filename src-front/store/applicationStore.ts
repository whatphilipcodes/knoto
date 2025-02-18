import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
//
import { ApiClient } from '../utils/api';
import { logger } from './middleware/logger';
import { withPersistentStorage } from './middleware/withPersistentStorage';

// Define your store types
interface ApplicationState {
  backendPort: number | undefined;
  backendAPI: ApiClient | undefined;
  // idea: data as map: metadata -> filepath ! content loaded on opening
  activeCollectionDir: string | undefined;
  setActiveCollection: (newCollection: string) => void;
}

// Create your stores using the typed middleware
export const useApplicationStore = create<ApplicationState>()(
  subscribeWithSelector(
    logger(
      withPersistentStorage<ApplicationState>(() => 'config.json')((set) => ({
        backendPort: undefined,
        backendAPI: undefined,
        activeCollectionDir: undefined,
        setActiveCollection: (activeCollectionDir) =>
          set({ activeCollectionDir }),
      })),
    ),
  ),
);
