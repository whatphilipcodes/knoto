import { create, ExtractState } from 'zustand';
import { combine } from 'zustand/middleware';

import { invoke } from '@tauri-apps/api/core';
import { ApiClient } from './api';

export type GlobalStore = ExtractState<typeof useGlobalStore>;

export const useGlobalStore = create(
  combine(
    {
      clientInstance: undefined as ApiClient | undefined,
    },
    (set) => ({
      initAPI: async () => {
        const port = await invoke<number>('get_port');
        set({ clientInstance: new ApiClient('http', 'localhost', port) });
      },
    }),
  ),
);
