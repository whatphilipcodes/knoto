import { Canvas } from '@react-three/fiber';
import { FC } from 'react';
import Nodes from './Nodes';
import Button from '../Primitives/Button';
import { Plus } from 'lucide-react';
import { emit } from '@tauri-apps/api/event';
import AtlasControls from './AtlasControls';
import { useAtlasStore } from '../../store/atlasStore';

interface AtlasRendererProps {
  atlasScale?: number;
  nodeScale?: number;
}

const AtlasRenderer: FC<AtlasRendererProps> = ({
  atlasScale = 1000,
  nodeScale = 0.2,
}) => {
  const atlas = useAtlasStore();

  // split-view: emit blur event
  const focusAtlas = () => {
    document.dispatchEvent(new CustomEvent('atlas:blur-editor'));
  };

  // to-do: fix canvas scaling (shrink)
  return (
    <div
      className='relative flex h-full w-full rounded-md border border-neutral-700 bg-neutral-900'
      onMouseDown={focusAtlas}
    >
      <Canvas className='rounded-md' flat>
        <Nodes
          data={atlas.nodes ?? []}
          nodeScale={nodeScale}
          atlasScale={atlasScale}
        />
        <AtlasControls
          bounds={{ x: atlasScale * 0.5 + 4, y: atlasScale * 0.5 + 4 }}
        />
      </Canvas>
      <div className='absolute bottom-0 right-0 p-4'>
        <Button
          variant='secondary'
          onClick={async () => await emit('atlas:new')}
          className='h-10 w-10 px-0'
        >
          <Plus size={20} />
        </Button>
      </div>
    </div>
  );
};

export default AtlasRenderer;
