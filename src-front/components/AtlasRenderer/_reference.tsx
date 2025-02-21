import { FC, useMemo, useRef } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { InstancedMesh, ShaderMaterial, Vector2, Object3D } from 'three';

const dummy = new Object3D();

interface AtlasRendererProps {}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float d = length(uv);
    float alpha = 1.0 - smoothstep(0.5, 0.5 + fwidth(d), d);
    gl_FragColor = vec4(vec3(1.0), alpha);
  }
`;

extend({ InstancedMesh, ShaderMaterial });

// New component that updates instance matrices
const Instances: FC<{
  data: Vector2[];
  meshRef: React.RefObject<InstancedMesh | null>;
}> = ({ data, meshRef }) => {
  useFrame(() => {
    if (!meshRef.current) return;
    data.forEach((p, i) => {
      dummy.position.set(p.x * 2 - 1, p.y * 2 - 1, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  return null;
};

const AtlasRenderer: FC<AtlasRendererProps> = () => {
  const meshRef = useRef<InstancedMesh>(null);
  const data = useMemo(() => {
    const points = [];
    for (let i = 0; i < 1000; i++) {
      points.push(new Vector2(Math.random(), Math.random()));
    }
    return points;
  }, []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
      }),
    [],
  );

  return (
    <div className='h-full w-full rounded-md bg-neutral-900'>
      <Canvas>
        <instancedMesh
          ref={meshRef}
          args={[undefined, undefined, data.length]}
          material={material}
        >
          <planeGeometry args={[0.02, 0.02]} />
        </instancedMesh>
        {meshRef.current !== null && (
          <Instances data={data} meshRef={meshRef} />
        )}
      </Canvas>
    </div>
  );
};

export default AtlasRenderer;
