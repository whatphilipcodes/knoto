import { useState } from 'react';
//
import { useApplicationStore } from '../store/applicationStore';

const ConnectButton = () => {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const application = useApplicationStore();

  const handleConnect = async () => {
    if (!application.backendAPI) {
      setResult('API client not initialized');
      return;
    }

    try {
      setIsLoading(true);
      const data = await application.backendAPI.testConnection();
      setResult(data);
    } catch (error) {
      setResult('Connection failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex w-2/3 flex-col gap-4'>
      <button
        onClick={handleConnect}
        disabled={isLoading || !application.backendAPI}
        className='cursor-pointer rounded border-none bg-blue-500 p-2 text-neutral-950 disabled:cursor-wait dark:text-neutral-50'
      >
        {isLoading ? 'Connecting...' : 'Test Connection'}
      </button>

      <div>
        {result && (
          <div className='select-text rounded border border-neutral-950 p-2 dark:border-neutral-50'>
            {result}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectButton;
