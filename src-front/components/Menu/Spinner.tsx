import { type FC } from 'react';
import { twMerge } from 'tailwind-merge';

interface Spinner {
  className?: string;
  thickness?: string;
}

const Spinner: FC<Spinner> = ({
  className = 'text-neutral-500',
  thickness = 'twd border-2',
}) => {
  const baseClasses = 'twd relative inline-block h-4 w-4';
  const classes = twMerge(className + baseClasses);

  return (
    <div className={classes}>
      <div
        className={`absolute h-full w-full animate-[spin_1.2s_cubic-bezier(0.5,0,0.5,1)_infinite] rounded-full ${thickness} border-solid border-current border-b-transparent border-l-transparent border-r-transparent`}
      ></div>
      <div
        className={`absolute h-full w-full animate-[spin_1.2s_cubic-bezier(0.5,0,0.5,1)_-0.45s_infinite] rounded-full ${thickness} border-solid border-current border-b-transparent border-l-transparent border-r-transparent`}
      ></div>
      <div
        className={`absolute h-full w-full animate-[spin_1.2s_cubic-bezier(0.5,0,0.5,1)_-0.3s_infinite] rounded-full ${thickness} border-solid border-current border-b-transparent border-l-transparent border-r-transparent`}
      ></div>
      <div
        className={`absolute h-full w-full animate-[spin_1.2s_cubic-bezier(0.5,0,0.5,1)_-0.15s_infinite] rounded-full ${thickness} border-solid border-current border-b-transparent border-l-transparent border-r-transparent`}
      ></div>
    </div>
  );
};

export default Spinner;
