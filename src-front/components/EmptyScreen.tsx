import { Folder } from 'lucide-react';
import { Command, Option } from 'lucide-react';
import Button from './Primitives/Button'; // Import the Button component

export default function EmptyScreen() {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <div className='text-center'>
        <Folder
          className='mx-auto h-12 w-12 text-gray-400 dark:text-gray-500'
          aria-hidden='true'
        />
        <h3 className='mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
          No Note Collection Loaded
        </h3>
        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
          Open a note collection to start viewing and editing your notes.
        </p>
        <Button
          variant='primary'
          onClick={() => alert('Open Collection button clicked')}
        >
          Open Collection
        </Button>
        <div className='mt-2 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400'>
          <Option className='mx-1 h-4 w-4' aria-hidden='true' />
          <Command className='mx-1 h-4 w-4' aria-hidden='true' />
          <span>O</span>
        </div>
      </div>
    </div>
  );
}
