import * as THREE from 'three';
import { FC, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
//
import Node from './Node';

interface AtlasRendererProps {
  count?: number;
}

const AtlasRenderer: FC<AtlasRendererProps> = ({ count = 1000 }) => {
  const testColor = new THREE.Color(0x54b882);
  const data = useMemo(() => {
    const nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        pos: new THREE.Vector2(Math.random(), Math.random()),
        col: testColor,
      });
    }
    return nodes;
  }, []);

  console.log(data);

  return (
    <div className='h-full w-full rounded-md bg-neutral-900'>
      <Canvas>
        <Node />
      </Canvas>
    </div>
  );
};

export default AtlasRenderer;
