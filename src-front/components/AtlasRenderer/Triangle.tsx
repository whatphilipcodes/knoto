import { ThreeElements } from '@react-three/fiber';
import { BufferGeometry, BufferAttribute } from 'three';
import { type FC, useLayoutEffect, useRef } from 'react';

type TriangleProps = ThreeElements['bufferGeometry'] & { size?: number };

const Triangle: FC<TriangleProps> = ({ children, size = 0.1 }) => {
  const geo = useRef<BufferGeometry>(null!);

  useLayoutEffect(() => {
    const vertices = new Float32Array([
      -1.0,
      -1.0,
      0,
      1.0,
      -1.0,
      0,
      0.0,
      Math.sqrt(3.0) - 1,
      0.0,
    ]);

    geo.current.setAttribute('position', new BufferAttribute(vertices, 3));
    geo.current.scale(size, size, size);
    geo.current.center();
  }, []);

  return <bufferGeometry ref={geo}>{children}</bufferGeometry>;
};

export default Triangle;
