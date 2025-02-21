import './styles/app.css';
import { useState, useEffect } from 'react';
import EmptyScreen from './components/EmptyScreen';
import APITest from './components/APITest';
//
import { listen } from '@tauri-apps/api/event';
//
import { createMenu } from './utils/menu';
import { useApplicationStore } from './store/applicationStore';
import { useCollectionStore, subscribeColToApp } from './store/collectionStore';

const App = () => {
  const [inputValue, setInputValue] = useState('');

  const application = useApplicationStore();
  const collection = useCollectionStore();

  useEffect(() => {
    const asyncSetup = async () => {
      await application.initAppConfigDir();
      await application.initBackendAPI();
      const asyncCleanup: (() => void)[] = [];
      asyncCleanup.push(await createMenu());
      asyncCleanup.push(
        await listen('menu:open-collection', async () => {
          await application.openCollectionDir();
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
    <main className='flex flex-col gap-4 p-12 font-normal text-neutral-950 dark:text-neutral-50'>
      <EmptyScreen />
      <APITest />
    </main>
  );
};
export default App;
