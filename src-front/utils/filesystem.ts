import { exists, mkdir } from '@tauri-apps/plugin-fs';
import { appConfigDir } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';

export const openDir = async () => {
  try {
    const dir = await open({
      multiple: false,
      directory: true,
    });
    if (!dir) return undefined;
    return dir;
  } catch (error) {
    console.log('An error occurred during openDir:', error);
  }
};

export const getAppConfigDir = async () => {
  try {
    const dir = await appConfigDir();
    if (await exists(dir)) {
      return dir;
    } else {
      await mkdir(dir);
      return dir;
    }
  } catch (error) {
    console.error('An error occurred in ensureAppConfig:', error);
  }
};
