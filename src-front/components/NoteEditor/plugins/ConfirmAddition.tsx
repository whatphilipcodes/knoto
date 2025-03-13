import { type FC } from 'react';
import { Check } from 'lucide-react';
import Button from '../../Primitives/Button';

interface ConfirmAdditionProps {
  onConfirm: () => void;
}

const ConfirmAddition: FC<ConfirmAdditionProps> = ({ onConfirm }) => {
  return (
    <Button
      variant='secondary'
      className='absolute bottom-4 right-4 h-10 w-10 px-0'
      onClick={onConfirm}
    >
      <Check size={20} />
    </Button>
  );
};
export default ConfirmAddition;
