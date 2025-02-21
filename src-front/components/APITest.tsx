import { useState } from 'react';
import { useApplicationStore } from '../store/applicationStore';
import Button from './Primitives/Button'; // Import the Button component

const APITest = () => {
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
      <Button
        onClick={handleConnect}
        disabled={isLoading || !application.backendAPI}
        variant='primary'
      >
        {isLoading ? 'Connecting...' : 'Test Connection'}
      </Button>

      <div>
        {result && (
          <div className='select-text rounded border border-neutral-950 p-2 dark:border-neutral-50 dark:text-neutral-50'>
            {result}
          </div>
        )}
      </div>
    </div>
  );
};

export default APITest;
