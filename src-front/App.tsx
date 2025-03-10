import './styles/app.css';
import { useLayoutEffect } from 'react';
import Menu from './components/Menu';
import AtlasRenderer from './components/AtlasRenderer';
import NoteEditor from './components/NoteEditor';
//
import { listen } from '@tauri-apps/api/event';
//
import { useApplicationStore } from './store/applicationStore';
import { subscribeColToApp } from './store/atlasStore';

const App = () => {
  const application = useApplicationStore();

  useLayoutEffect(() => {
    const asyncSetup = async () => {
      await application.initAppConfigDir();
      await application.initBackendAPI();
      // await application.backendAPI?.connect();
      const asyncCleanup: (() => void)[] = [];
      asyncCleanup.push(
        await listen('menu:open-atlas', async () => {
          await application.openAtlasDir();
        }),
        await listen('atlas:open', async (data) => {
          console.log('atlas:open', data);
        }),
        await listen('atlas:new', async () => {
          console.log('atlas:new');
        }),
      );
      subscribeColToApp(); // has to run after api init
      return asyncCleanup;
    };
    const asyncCleanup = asyncSetup();
    return () => {
      asyncCleanup.then((cfa) => cfa.forEach((f) => f()));
    };
  }, []);

  return (
    <main className='flex h-full w-full flex-col gap-4 p-4 font-normal text-neutral-950 dark:text-neutral-50'>
      <Menu />
      <div className='flex h-full w-full shrink grow gap-4'>
        <AtlasRenderer />
        <NoteEditor />
      </div>
    </main>
  );
};
export default App;
