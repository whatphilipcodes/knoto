import './styles/app.css';
import { useState, useLayoutEffect } from 'react';
import AtlasRenderer from './components/AtlasRenderer';
import Menu from './components/Menu';
import Button from './components/Primitives/Button';
//
import { listen } from '@tauri-apps/api/event';
//
import { useApplicationStore } from './store/applicationStore';
import { useAtlasStore, subscribeColToApp } from './store/atlasStore';
//

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const application = useApplicationStore();
  const atlas = useAtlasStore();

  useLayoutEffect(() => {
    const asyncSetup = async () => {
      await application.initAppConfigDir();
      await application.initBackendAPI();
      const asyncCleanup: (() => void)[] = [];
      asyncCleanup.push(
        await listen('menu:open-atlas', async () => {
          await application.openAtlasDir();
        }),
        await listen('atlas:open-editor', async (data) => {
          console.log('atlas:open-editor', data);
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
    <>
      <main className='flex h-full w-full flex-col gap-4 p-4 font-normal text-neutral-950 dark:text-neutral-50'>
        <Menu />
        <div className='flex h-full w-full shrink grow'>
          <AtlasRenderer />
        </div>
        {/* <div className='rounded-md bg-neutral-900 p-2 ring-inset focus-within:ring-2 focus-within:ring-blue-500'>
          <textarea
            value={inputValue}
            placeholder='Say something nice...'
            onChange={(e) => setInputValue(e.target.value)}
            className='h-full w-full bg-neutral-900 focus:outline-none'
          ></textarea>
        </div>
        <Button
          onClick={() => {
            atlas.test(inputValue);
          }}
        >
          save to atlas store
        </Button> */}
      </main>
    </>
  );
};
export default App;
