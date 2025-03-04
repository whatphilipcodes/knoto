import { type FC } from 'react';
import { Mesh, Vector3, Euler } from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Wireframe, CameraControls } from '@react-three/drei';
//
import { hexToShaderColor } from './helper';
//
import frag from './lib/node.frag';
import vert from './lib/node.vert';

interface NodeProps {}

const Node: FC<NodeProps> = () => {
  const meshRef = useRef<Mesh>(null);
  useFrame(() => {
    // ...existing code...
  });

  return (
    <>
      {/* <mesh
        position={new Vector3(0.4, 0.2, 0.8)}
        rotation={new Euler(0.1, 0.4, 0.2)}
      >
        <planeGeometry />
        <Wireframe />
      </mesh> */}
      <mesh
        ref={meshRef}
        position={new Vector3(0.4, 0.2, 0.8)}
        rotation={new Euler(0.1, 0.4, 0.2)}
      >
        <planeGeometry />
        <shaderMaterial
          vertexShader={vert}
          fragmentShader={frag}
          uniforms={{ uColor: { value: hexToShaderColor('#8387f1') } }}
          transparent
        />
      </mesh>
      <CameraControls />
    </>
  );
};
export default Node;
