import { exists, mkdir } from '@tauri-apps/plugin-fs';
import { appConfigDir } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';

export async function openCollectionDir(): Promise<void> {
  try {
    const dir = await open({
      multiple: false,
      directory: true,
    });
    if (!dir) {
      console.error('No directory was selected.');
      return;
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

export const ensureAppConfig = async () => {
  const dir = await appConfigDir();
  if (await exists(dir)) {
    console.log('config dir available:', dir);
    return;
  } else {
    console.log('config dir has to be created');
    await mkdir(dir);
    console.log('config dir created at:', dir);
  }
};
