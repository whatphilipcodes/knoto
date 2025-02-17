import './styles/app.css';
import knotoIcon from './assets/knoto.svg';

import { useEffect } from 'react';
import { useGlobalStore } from './utils/zustand';
import ConnectButton from './components/ConnectButton';
// import TextEditor from './components/TextEditor/TextEditor';
// import FixedGraph from './components/FixedGraph';

const App = () => {
  const initBackendAPI = useGlobalStore((state) => state.initBackendAPI);

  useEffect(() => {
    initBackendAPI();
  }, [initBackendAPI]);

  return (
    <main className='flex flex-col gap-4 p-12 font-normal text-neutral-950 dark:text-neutral-50'>
      <img src={knotoIcon} className='h-[80px] self-start' />
      <p>
        The Python API is starting in the background. This demo setup is not
        showing any loading state. Because of that, inital connection attemps
        might fail until the uvicorn server has been launched successfully.
      </p>
      <ConnectButton />
      {/* <TextEditor /> */}
      {/* <FixedGraph /> */}
    </main>
  );
};

export default App;
