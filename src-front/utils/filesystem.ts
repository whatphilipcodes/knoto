// import {
//   // readDir,
//   readTextFile,
//   writeTextFile,
//   exists,
//   mkdir,
// } from '@tauri-apps/plugin-fs';
// import { appConfigDir, /*homeDir,*/ sep } from '@tauri-apps/api/path';
// import { open } from '@tauri-apps/plugin-dialog';

// export async function openCollectionDir(): Promise<void> {
//   try {
//     const dir = await open({
//       multiple: false,
//       directory: true,
//     });
//     if (!dir) {
//       console.error('No directory was selected.');
//       return;
//     }
//   } catch (error) {
//     console.error('An error occurred:', error);
//   }
// }

// export const persistAppConfig = {
//   getItem: async (name: string) => {
//     const path = (await appConfigDir()) + sep() + name;
//     return await getJSON(path);
//   },
//   setItem: async (name: string, value: string) => {
//     const path = (await appConfigDir()) + sep() + name;
//     await setJSON(path, value);
//   },
//   removeItem: async (_: string) => {
//     // not necessary in this case, has to be included for zustand
//   },
// };

// export const persistCollectionConfig = {
//   getItem: async (name: string) => {
//     const path = (await homeDir()) + sep() + collectionDir + name;
//     return await getJSON(path);
//   },
//   setItem: async (name: string, value: string) => {
//     const path = (await homeDir()) + sep() + collectionDir + name;
//     await setJSON(path, value);
//   },
//   removeItem: async (_: string) => {
//     // not necessary in this case, has to be included for zustand
//   },
// };

// const getJSON = async (path: string) => {
//   try {
//     return await readTextFile(path);
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// };

// const setJSON = async (path: string, data: string) => {
//   try {
//     await writeTextFile(path, data);
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const ensureAppConfig = async () => {
//   const dir = await appConfigDir();
//   if (await exists(dir)) {
//     console.log('config dir available:', dir);
//     return;
//   } else {
//     console.log('config dir has to be created');
//     await mkdir(dir);
//     console.log('config dir created at:', dir);
//   }
// };

// export const initCollectionDir = async (path: string) => {
//   try {
//   } catch (error) {}
// };
