import { type FC, useLayoutEffect, useMemo } from 'react';
import { platform } from '@tauri-apps/plugin-os';
import { sep } from '@tauri-apps/api/path';
//
import { useAtlasStore } from '../../store/atlasStore';
import MenuComponent from './menuComponent';
import MenuStatus from './Status';
import { createMacMenu } from './menuMac';

interface MenuProps {}

const current = platform();

const Menu: FC<MenuProps> = () => {
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

  switch (current) {
    case 'macos':
      return (
        <div className='flex w-full flex-row justify-between text-neutral-500'>
          <div className='flex w-fit flex-row gap-4'>
            <div>{atlasName}</div>
            <MenuStatus />
          </div>
        </div>
      );
    default:
      return (
        <div className='flex w-full flex-row items-center justify-between text-neutral-500'>
          <div className='flex w-fit flex-row gap-4'>
            <div>{atlasName}</div>
            <MenuStatus />
          </div>
          <MenuComponent />
        </div>
      );
  }
};

export default Menu;
