import { Vector2, Color, InstancedMesh, Object3D, Euler } from 'three';
import { type FC, useRef, useLayoutEffect, useMemo } from 'react';
import Triangle from './Triangle';

interface NodesProps {
  data: {
    pos: Vector2;
    col: Color;
  }[];
  nodeScale?: number;
  atlasScale?: number;
}

const Nodes: FC<NodesProps> = ({
  data,
  nodeScale = 0.1,
  atlasScale = 1000,
}) => {
  const ref = useRef<InstancedMesh>(null!);
  const origin = new Object3D();

  const colors = useMemo(() => {
    return new Float32Array(data.map(({ col }) => col.toArray()).flat());
  }, [data]);

  // Calculate the center point of all nodes
  const center = useMemo(() => {
    if (data.length === 0) return new Vector2(0, 0);

    const sum = data.reduce(
      (acc, entry) => acc.add(entry.pos),
      new Vector2(0, 0),
    );

    return sum.divideScalar(data.length);
  }, [data]);

  useLayoutEffect(() => {
    let i = 0;
    data.forEach((entry) => {
      const id = i++;
      origin.position.set(
        (entry.pos.x - center.x) * atlasScale,
        (entry.pos.y - center.y) * atlasScale,
        0,
      );
      origin.updateMatrix();
      ref.current.setMatrixAt(id, origin.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [data, atlasScale, center]);

  return (
    <>
      <instancedMesh ref={ref} args={[undefined, undefined, data.length]}>
        <Triangle size={nodeScale}>
          <instancedBufferAttribute
            attach='attributes-color'
            args={[colors, 3]}
          />
        </Triangle>
        <meshBasicMaterial vertexColors depthTest={false} depthWrite={false} />
      </instancedMesh>
      <mesh rotation={new Euler(0, 0, Math.PI)}>
        <Triangle size={0.2} />
        <meshBasicMaterial
          color={0xf6c99f}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </>
  );
};
export default Nodes;
