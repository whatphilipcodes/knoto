import { exists, mkdir } from '@tauri-apps/plugin-fs';
import { appConfigDir, appDataDir } from '@tauri-apps/api/path';
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

export const getAppDirs = async () => {
  let config: string;
  let data: string;
  try {
    const tmpConfig = await appConfigDir();
    if (!(await exists(tmpConfig))) {
      await mkdir(tmpConfig);
    }
    config = tmpConfig;

    const tmpData = await appDataDir();
    if (!(await exists(tmpData))) {
      await mkdir(tmpData);
    }
    data = tmpData;

    return [config, data];
  } catch (error) {
    console.error('An error occurred in getAppDirs:', error);
    return [null, null];
  }
};
