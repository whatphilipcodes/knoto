import { FC, useMemo } from 'react';
import { Color, Vector2 } from 'three';
import { Canvas } from '@react-three/fiber';
import AtlasControls from './AtlasControls';
import Nodes from './Nodes';
import Button from '../Primitives/Button';
import { Plus } from 'lucide-react';
import { emit } from '@tauri-apps/api/event';

interface AtlasRendererProps {
  _testCount?: number;
  atlasScale?: number;
  nodeScale?: number;
}

const AtlasRenderer: FC<AtlasRendererProps> = ({
  _testCount = 1000000,
  atlasScale = 1000,
  nodeScale = 0.2,
}) => {
  const testColors: Color[] = [];
  testColors.push(new Color(0x8387f1));
  testColors.push(new Color(0x545ac1));
  testColors.push(new Color(0x2e3064));

  const data = useMemo(() => {
    const nodes = [];
    for (let i = 0; i < _testCount; i++) {
      nodes.push({
        path: 'path/to/file_' + i,
        pos: new Vector2(Math.random(), Math.random()),
        col: testColors[i % testColors.length],
      });
    }
    return nodes;
  }, []);

  // split-view: emit blur event
  const focusAtlas = () => {
    document.dispatchEvent(new CustomEvent('blur:text-editor'));
  };

  // to-do: fix canvas scaling (shrink)
  return (
    <div
      className='relative flex h-full w-full rounded-md border border-neutral-700 bg-neutral-900'
      onMouseDown={focusAtlas}
    >
      <Canvas className='rounded-md' flat>
        <Nodes data={data} nodeScale={nodeScale} atlasScale={atlasScale} />
        <AtlasControls
          bounds={new Vector2(atlasScale * 0.5 + 4, atlasScale * 0.5 + 4)}
        />
      </Canvas>
      <div className='absolute bottom-0 right-0 p-4'>
        <Button onClick={() => emit('atlas:new')} className='h-10 w-10 px-0'>
          <Plus size={20} />
        </Button>
      </div>
    </div>
  );
};

export default AtlasRenderer;
