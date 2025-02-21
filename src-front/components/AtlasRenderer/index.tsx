import * as THREE from 'three';
import { FC, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';

interface AtlasRendererProps {
  count?: number;
}

const AtlasRenderer: FC<AtlasRendererProps> = ({ count = 1000 }) => {
  const data = useMemo(() => {
    const points = [];
    for (let i = 0; i < count; i++) {
      points.push(new THREE.Vector2(Math.random(), Math.random()));
    }
    return points;
  }, []);

  // console.log(data);

  return (
    <div className='h-full w-full rounded-md bg-neutral-900'>
      <Canvas></Canvas>
    </div>
  );
};

export default AtlasRenderer;
