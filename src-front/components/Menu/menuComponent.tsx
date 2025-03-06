import { type FC, useState, useRef, useEffect } from 'react';
import { EllipsisVertical } from 'lucide-react';
//
import { emit } from '@tauri-apps/api/event';
//
import Button from '../Primitives/Button';

interface MenuComponentProps {}

const MenuComponent: FC<MenuComponentProps> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        menuContainerRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuButtonClasses =
    'twd w-full px-4 py-2 text-left text-sm hover:bg-neutral-700';

  return (
    <div className='relative' ref={menuContainerRef}>
      <Button variant='secondary' className='h-6 w-6 px-0' onClick={toggleMenu}>
        <EllipsisVertical size={14} />
      </Button>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className='absolute right-0 z-50 mt-2 w-56 origin-top-right overflow-clip rounded-md bg-neutral-800 text-neutral-200 shadow-lg ring-1 ring-neutral-500 ring-opacity-5'
        >
          <div>
            <button
              className={menuButtonClasses}
              onClick={() => {
                emit('menu:open-atlas');
                setIsMenuOpen(false);
              }}
            >
              Open Atlas
            </button>
            <hr className='border-neutral-500' />
            <button
              className={
                menuButtonClasses + ' text-neutral-500 hover:bg-neutral-800'
              }
            >
              Settings
            </button>
            <button
              className={
                menuButtonClasses + ' text-neutral-500 hover:bg-neutral-800'
              }
            >
              Help & Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default MenuComponent;
