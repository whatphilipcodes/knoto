import './styles/app.css';
import { useState, useEffect } from 'react';

import { listen } from '@tauri-apps/api/event';

import { createMenu } from './utils/menu';
import { useApplicationStore } from './store/applicationStore';
import { useCollectionStore, initColSubToApp } from './store/collectionStore';

const App = () => {
  const [inputValue, setInputValue] = useState('');

  const application = useApplicationStore();
  const collection = useCollectionStore();

  useEffect(() => {
    let clearMenu: () => Promise<void> = () => Promise.resolve();
    const asyncSetup = async () => {
      clearMenu = await createMenu();
    };
    asyncSetup();
    const clearColSubToApp = initColSubToApp();
    return () => {
      clearColSubToApp();
      clearMenu();
    };
  }, []);

  return (
    <main className='flex flex-col gap-4 p-12 font-normal text-neutral-950 dark:text-neutral-50'>
      <textarea
        className='bg-white text-black'
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button
        className='bg-amber-600'
        onClick={() => {
          application.setActiveCollection(inputValue);
        }}
      >
        set app data
      </button>
      <button
        className='bg-blue-500'
        onClick={() => {
          collection.setTestValue(inputValue);
        }}
      >
        set collection data
      </button>
    </main>
  );
};
export default App;
