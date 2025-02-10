import { create, ExtractState } from 'zustand';
import { combine } from 'zustand/middleware';

import { invoke } from '@tauri-apps/api/core';
import { ApiClient } from './api';

export type GlobalStore = ExtractState<typeof useGlobalStore>;

export const useGlobalStore = create(
  combine(
    {
      backendPort: undefined as number | undefined,
      backendAPI: undefined as ApiClient | undefined,
    },
    (set) => ({
      initBackendAPI: async () => {
        const port = await invoke<number>('get_port');
        set({ backendPort: port });
        set({ backendAPI: new ApiClient('http', 'localhost', port) });
      },
    }),
  ),
);
