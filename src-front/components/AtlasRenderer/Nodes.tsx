import { Vector2, Color, InstancedMesh, Object3D, Euler } from 'three';
import { type FC, useRef, useLayoutEffect, useMemo, useEffect } from 'react';
import HoverSelect from './HoverSelect';
import Triangle from './Triangle';
import { NodeData } from '../../utils/types';

interface NodesProps {
  data: NodeData[];
  nodeScale?: number;
  atlasScale?: number;
  onNodeHover?: (nodeId: string | number | null, index: number | null) => void;
  debug?: boolean;
  hoverColor?: Color;
}

const Nodes: FC<NodesProps> = ({
  data = [],
  nodeScale = 0.1,
  atlasScale = 1000,
  onNodeHover,
  debug = false,
  hoverColor = new Color(0xf6c99f), // Default hover color (magenta)
}) => {
  const ref = useRef<InstancedMesh>(null!);
  const origin = useMemo(() => new Object3D(), []);

  // Calculate center once
  const center = useMemo(() => {
    if (data.length === 0) return new Vector2(0, 0);
    const sum = data.reduce(
      (acc, entry) => acc.add(entry.pos),
      new Vector2(0, 0),
    );
    return sum.divideScalar(data.length);
  }, [data, data.length]);

  if (debug) {
    useEffect(() => {
      console.log('Center calculated:', center.toArray());
      console.log('Atlas scale:', atlasScale);
      console.log('Node scale:', nodeScale);
    }, [center, atlasScale, nodeScale]);
  }

  // Process colors
  const colors = useMemo(() => {
    return new Float32Array(
      data.map(({ col }) => new Color(col).toArray()).flat(),
    );
  }, [data, data.length]);

  // Set up instance matrices efficiently
  useLayoutEffect(() => {
    if (!ref.current || data.length === 0) return;

    if (debug) {
      console.log('Setting up instance matrices for', data.length, 'instances');
    }

    // Process in batches for large datasets
    const batchSize = 10000;
    for (let i = 0; i < data.length; i += batchSize) {
      const end = Math.min(i + batchSize, data.length);

      for (let j = i; j < end; j++) {
        const entry = data[j];
        origin.position.set(
          (entry.pos.x - center.x) * atlasScale,
          (entry.pos.y - center.y) * atlasScale,
          0,
        );
        origin.scale.set(1, 1, 1); // Ensure scale is reset
        origin.updateMatrix();
        ref.current.setMatrixAt(j, origin.matrix);
      }
    }

    ref.current.instanceMatrix.needsUpdate = true;

    if (debug) {
      console.log('Instance matrices updated');
    }
  }, [data, data.length, atlasScale, center, origin, debug]);

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
        <Triangle size={nodeScale} />
        <meshBasicMaterial
          color={0xf6c99f}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      <HoverSelect
        data={data}
        nodeScale={nodeScale}
        atlasScale={atlasScale}
        center={center}
        hoverColor={hoverColor}
        onNodeHover={onNodeHover}
      />
    </>
  );
};

export default Nodes;
