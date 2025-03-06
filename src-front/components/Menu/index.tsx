import { type FC, useLayoutEffect } from 'react';
import { platform } from '@tauri-apps/plugin-os';
import { createMacMenu } from './menuMac';

interface MenuProps {}

const current = platform();

const Menu: FC<MenuProps> = () => {
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

  switch (current) {
    case 'macos':
      return <></>;
    default:
      return <div>windows</div>;
  }
};
export default Menu;
