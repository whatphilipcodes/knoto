import { useRef } from 'react';
import { sep } from '@tauri-apps/api/path';
import { rename, BaseDirectory } from '@tauri-apps/plugin-fs';
import { useAtlasStore } from '../store/atlasStore';

export function useRename(baseDir: BaseDirectory = BaseDirectory.Home) {
  const atlas = useAtlasStore();
  const renameInProgress = useRef(false);
  const lastRenameRequest = useRef<string | null>(null);

  const renameFile = async (name: string) => {
    lastRenameRequest.current = name;
    if (renameInProgress.current) return;
    renameInProgress.current = true;
    try {
      while (lastRenameRequest.current !== null) {
        const currentName = lastRenameRequest.current;
        lastRenameRequest.current = null;

        const path =
          atlas.atlasRootDir + sep() + atlas.atlasSubdirNotes + sep();
        const current = atlas.activeNode;
        if (!current) break;

        const updated = {
          ...current,
          filepath: currentName,
        };
        const completed = await atlas.updateNode(updated);
        atlas.setActiveNode(completed);
        await rename(path + current.filepath, path + completed.filepath, {
          oldPathBaseDir: baseDir,
          newPathBaseDir: baseDir,
        });
      }
    } finally {
      renameInProgress.current = false;
    }
  };
  return { renameFile };
}
