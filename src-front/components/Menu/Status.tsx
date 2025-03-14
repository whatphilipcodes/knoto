import { type FC, useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';

interface MenuStatusProps {}

const MenuStatus: FC<MenuStatusProps> = () => {
  const [error, setError] = useState<boolean>(false);
  useEffect(() => {
    const asyncSetup = async () => {
      const asyncCleanup: (() => void)[] = [];
      asyncCleanup.push(
        await listen('fs:atlas-load', () => {
          setError(false);
        }),
        await listen('fs:atlas-error', () => {
          setError(true);
        }),
      );
      return asyncCleanup;
    };
    const asyncCleanup = asyncSetup();
    return () => {
      asyncCleanup.then((cfa) => cfa.forEach((f) => f()));
    };
  }, []);
  return (
    <div className='text-rose-600'>
      {error
        ? 'an error occured: the atlas you last opened was moved, deleted or is damaged'
        : ''}
    </div>
  );
};
export default MenuStatus;
