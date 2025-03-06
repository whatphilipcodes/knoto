import { FC, useMemo } from 'react';
import { Color, Vector2 } from 'three';
import { Canvas } from '@react-three/fiber';
//
import AtlasControls from './AtlasControls';
import Nodes from './Nodes';

interface AtlasRendererProps {
  count?: number;
}

const AtlasRenderer: FC<AtlasRendererProps> = ({ count = 1000000 }) => {
  const testColors: Color[] = [];
  testColors.push(new Color(0x8387f1));
  testColors.push(new Color(0x545ac1));
  testColors.push(new Color(0x2e3064));

  const data = useMemo(() => {
    const nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        pos: new Vector2(Math.random(), Math.random()),
        col: testColors[i % testColors.length],
      });
    }
    return nodes;
  }, []);

  return (
    <div className='h-full w-full rounded-md border border-neutral-700 bg-neutral-900'>
      <Canvas className='rounded-md'>
        <Nodes data={data} />
        <AtlasControls />
      </Canvas>
    </div>
  );
};

export default AtlasRenderer;
