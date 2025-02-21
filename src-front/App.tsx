import './styles/app.css';
import { useState, useEffect } from 'react';
// import EmptyScreen from './components/EmptyScreen';
// import APITest from './components/APITest';
import AtlasRenderer from './components/AtlasRenderer';
//
import { listen } from '@tauri-apps/api/event';
//
import { createMenu } from './utils/menu';
import { useApplicationStore } from './store/applicationStore';
import { useAtlasStore, subscribeColToApp } from './store/atlasStore';

const App = () => {
  // const [inputValue, setInputValue] = useState('');

  const application = useApplicationStore();
  // const atlas = useAtlasStore();

  useEffect(() => {
    const asyncSetup = async () => {
      await application.initAppConfigDir();
      await application.initBackendAPI();
      const asyncCleanup: (() => void)[] = [];
      asyncCleanup.push(await createMenu());
      asyncCleanup.push(
        await listen('menu:open-atlas', async () => {
          await application.openAtlasDir();
        }),
      );
      return asyncCleanup;
    };
    const asyncCleanup = asyncSetup();
    const clearColSubToApp = subscribeColToApp();
    return () => {
      clearColSubToApp();
      asyncCleanup.then((cfa) => cfa.forEach((f) => f()));
    };
  }, []);

  return (
    <main className='flex h-full w-full flex-col gap-4 p-12 font-normal text-neutral-950 dark:text-neutral-50'>
      {/* <EmptyScreen />
      <APITest /> */}
      <AtlasRenderer />
    </main>
  );
};
export default App;
