import './styles/app.css';
import knotoIcon from './assets/knoto.svg';
import ConnectButton from './components/ConnectButton';

import { useEffect } from 'react';
import { useGlobalStore } from './utils/zustand';

const App = () => {
  const initAPI = useGlobalStore((state) => state.initAPI);

  useEffect(() => {
    initAPI();
  }, [initAPI]);

  return (
    <main className='flex flex-col gap-4 p-12 font-normal text-neutral-950 dark:text-neutral-50'>
      <img src={knotoIcon} className='h-[80px] self-start' />
      <p>
        The Python API is starting in the background. This demo setup is not
        showing any loading state. Because of that, inital connection attemps
        might fail until the uvicorn server has been launched successfully.
      </p>
      <ConnectButton />
    </main>
  );
};

export default App;
