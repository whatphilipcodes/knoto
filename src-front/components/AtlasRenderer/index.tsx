import { FC, useMemo } from 'react';
import { Color, Vector2 } from 'three';
import { Canvas } from '@react-three/fiber';
//
import AtlasControls from './AtlasControls';
import Nodes from './Nodes';

interface AtlasRendererProps {
  count?: number;
  scale?: number;
}

const AtlasRenderer: FC<AtlasRendererProps> = ({
  count = 1000000,
  scale = 1000,
}) => {
  const testColors: Color[] = [];
  testColors.push(new Color(0x8387f1));
  testColors.push(new Color(0x545ac1));
  testColors.push(new Color(0x2e3064));

  const data = useMemo(() => {
    const nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        path: 'path/to/file_' + i,
        pos: new Vector2(Math.random(), Math.random()),
        col: testColors[i % testColors.length],
      });
    }
    return nodes;
  }, []);

  // to-do: fix canvas scaling (shrink)
  return (
    <div className='flex h-full w-full rounded-md border border-neutral-700 bg-neutral-900'>
      <Canvas className='rounded-md' flat>
        <Nodes
          data={data}
          nodeScale={0.2}
          atlasScale={scale}
          onNodeHover={(id, index) => {
            if (id !== null) {
              console.log(`Hovering over node ${id} at index ${index}`);
              // Update UI or state based on the hovered node
            }
          }}
        />
        <AtlasControls bounds={new Vector2(scale * 0.5 + 4, scale * 0.5 + 4)} />
      </Canvas>
    </div>
  );
};

export default AtlasRenderer;
