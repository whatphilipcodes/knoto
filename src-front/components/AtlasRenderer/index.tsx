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
  count = 1000,
  scale = 100,
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

  return (
    <div className='flex h-full w-full rounded-md border border-neutral-700 bg-neutral-900'>
      <Canvas flat>
        <Nodes data={data} atlasScale={scale} />
        <Nodes
          data={data}
          nodeScale={1}
          atlasScale={scale}
          onNodeHover={(id, index) => {
            if (id !== null) {
              console.log(`Hovering over node ${id} at index ${index}`);
              // Update UI or state based on the hovered node
            }
          }}
        />
        <AtlasControls
          bounds={new Vector2(scale * 0.5, scale * 0.5)}
          minZoom={1}
          maxZoom={100}
          startZoom={5}
        />
      </Canvas>
    </div>
  );
};

export default AtlasRenderer;
