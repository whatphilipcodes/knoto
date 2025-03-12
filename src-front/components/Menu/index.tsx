import { useApplicationStore } from '../../store/applicationStore';
import { useAtlasStore } from '../../store/atlasStore';
//
import { type FC, useLayoutEffect, useMemo } from 'react';
import { platform } from '@tauri-apps/plugin-os';
import MenuComponent from './menuComponent';
import { sep } from '@tauri-apps/api/path';
import { createMacMenu } from './menuMac';
import MenuStatus from './Status';
import LoadingSpinner from './Spinner';

interface MenuProps {}

const current = platform();

const Menu: FC<MenuProps> = () => {
  const application = useApplicationStore();
  const atlas = useAtlasStore();

  useLayoutEffect(() => {
    const asyncSetup = async () => {
      const asyncCleanup: (() => void)[] = [];
      switch (current) {
        case 'macos':
          asyncCleanup.push(await createMacMenu());
          console.log('macos');
          break;
        case 'windows':
          console.log('windows');
          break;
        default:
          console.log('OS does not support app menu');
          break;
      }
      return asyncCleanup;
    };
    const asyncCleanup = asyncSetup();
    return () => {
      asyncCleanup.then((cfa) => cfa.forEach((f) => f()));
    };
  }, []);

  const atlasName = useMemo(() => {
    if (!atlas.atlasRootDir) return 'no atlas opened';
    const parts = atlas.atlasRootDir.split(sep());
    return parts[parts.length - 1];
  }, [atlas.atlasRootDir]);

  return (
    <div className='flex w-full flex-row items-center justify-between text-neutral-500'>
      <div className='flex w-fit flex-row items-center gap-4'>
        <div>{atlasName}</div>
        {(!application.backendAPI || !atlas.nodes) && <LoadingSpinner />}
        <MenuStatus />
      </div>
      {/* {current !== 'macos' && <MenuComponent />} */}
      <MenuComponent />
    </div>
  );
};

export default Menu;
