import { FC, useMemo } from 'react';
import { Color, Vector2 } from 'three';
import { Canvas } from '@react-three/fiber';
import AtlasControls from './AtlasControls';
import Nodes from './Nodes';
import Button from '../Primitives/Button';
import { Plus } from 'lucide-react';
import { emit } from '@tauri-apps/api/event';
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

  const testColors: Color[] = [];
  testColors.push(new Color(0x8387f1));
  testColors.push(new Color(0x545ac1));
  testColors.push(new Color(0x2e3064));

  const data = useMemo(() => {
    const nodes = atlas.nodes;
    if (!nodes) {
      return [];
    }
    const filtered = nodes.map((node) => {
      const randomColor =
        testColors[Math.floor(Math.random() * testColors.length)];
      return {
        path: node.filepath,
        pos: new Vector2(node.coordinates.x, node.coordinates.y),
        col: randomColor,
      };
    });
    return filtered;
  }, [atlas.nodes]);

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
        <Button
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
