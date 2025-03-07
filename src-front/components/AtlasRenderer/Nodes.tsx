import { Vector2, Color, InstancedMesh, Object3D, Euler, Vector3 } from 'three';
import {
  type FC,
  useRef,
  useLayoutEffect,
  useMemo,
  useState,
  useEffect,
} from 'react';
import Triangle from './Triangle';
import { useFrame, useThree } from '@react-three/fiber';

interface NodesProps {
  data: {
    pos: Vector2;
    col: Color;
    path: string;
  }[];
  nodeScale?: number;
  atlasScale?: number;
  onNodeHover?: (nodeId: string | number | null, index: number | null) => void;
  debug?: boolean;
  hoverColor?: Color;
}

const Nodes: FC<NodesProps> = ({
  data,
  nodeScale = 0.1,
  atlasScale = 1000,
  onNodeHover,
  debug = false,
  hoverColor = new Color(0xf6c99f), // Default hover color (magenta)
}) => {
  const ref = useRef<InstancedMesh>(null!);
  const origin = useMemo(() => new Object3D(), []);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<Vector3 | null>(null);
  const [_noHitCounter, setNoHitCounter] = useState(0);

  // Create an optimized spatial index for the data
  const spatialIndex = useMemo(() => {
    if (data.length === 0)
      return {
        grid: new Map(),
        cellSize: 0,
        bounds: { min: new Vector2(), max: new Vector2() },
      };

    // Determine bounds
    const min = new Vector2(Infinity, Infinity);
    const max = new Vector2(-Infinity, -Infinity);

    data.forEach((entry) => {
      min.x = Math.min(min.x, entry.pos.x);
      min.y = Math.min(min.y, entry.pos.y);
      max.x = Math.max(max.x, entry.pos.x);
      max.y = Math.max(max.y, entry.pos.y);
    });

    // Create cells based on density
    // Using a finer grid for better precision
    const cellCount = Math.max(20, Math.min(200, Math.sqrt(data.length / 5)));
    const cellSize = Math.max(
      (max.x - min.x) / cellCount,
      (max.y - min.y) / cellCount,
    );

    // Create grid
    const grid = new Map<string, number[]>();

    data.forEach((entry, index) => {
      const cellX = Math.floor((entry.pos.x - min.x) / cellSize);
      const cellY = Math.floor((entry.pos.y - min.y) / cellSize);
      const cellKey = `${cellX},${cellY}`;

      if (!grid.has(cellKey)) {
        grid.set(cellKey, []);
      }
      grid.get(cellKey)!.push(index);
    });

    if (debug) {
      console.log('Spatial index created:', {
        nodes: data.length,
        cells: grid.size,
        bounds: { min: min.toArray(), max: max.toArray() },
        cellSize,
      });
    }

    return { grid, cellSize, bounds: { min, max } };
  }, [data, debug]);

  // Calculate center once
  const center = useMemo(() => {
    if (data.length === 0) return new Vector2(0, 0);
    const sum = data.reduce(
      (acc, entry) => acc.add(entry.pos),
      new Vector2(0, 0),
    );
    return sum.divideScalar(data.length);
  }, [data]);

  if (debug) {
    useEffect(() => {
      console.log('Center calculated:', center.toArray());
      console.log('Atlas scale:', atlasScale);
      console.log('Node scale:', nodeScale);
    }, [center, atlasScale, nodeScale]);
  }

  // Process colors
  const colors = useMemo(() => {
    return new Float32Array(data.map(({ col }) => col.toArray()).flat());
  }, [data]);

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
  }, [data, atlasScale, center, origin, debug]);

  // Get needed Three.js objects
  const { camera, pointer } = useThree();

  // Handle hover detection efficiently using spatial index
  useFrame(() => {
    if (!ref.current || data.length === 0) return;

    // Convert mouse coordinates to clip space (-1 to 1)
    const mouseX = pointer.x;
    const mouseY = pointer.y;

    // Project into world space
    const worldPos = new Vector3(mouseX, mouseY, 0);
    worldPos.unproject(camera);

    // Convert to data space coordinates
    const dataPos = new Vector2(
      worldPos.x / atlasScale + center.x,
      worldPos.y / atlasScale + center.y,
    );

    if (debug && Math.random() < 0.01) {
      // Sample logging to avoid console spam
      console.log('Mouse position:', { mouseX, mouseY });
      console.log('World position:', {
        x: worldPos.x,
        y: worldPos.y,
        z: worldPos.z,
      });
      console.log('Data position:', { x: dataPos.x, y: dataPos.y });
    }

    // Find the cell
    const cellX = Math.floor(
      (dataPos.x - spatialIndex.bounds.min.x) / spatialIndex.cellSize,
    );
    const cellY = Math.floor(
      (dataPos.y - spatialIndex.bounds.min.y) / spatialIndex.cellSize,
    );

    // Check if we have nodes in this cell or adjacent cells
    let candidateIndices: number[] = [];

    // Check current cell and neighboring cells
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const neighborKey = `${cellX + dx},${cellY + dy}`;
        if (spatialIndex.grid.has(neighborKey)) {
          candidateIndices = candidateIndices.concat(
            spatialIndex.grid.get(neighborKey)!,
          );
        }
      }
    }

    // No nodes in this or adjacent cells
    if (candidateIndices.length === 0) {
      if (hoverIndex !== null) {
        setHoverIndex(null);
        setHoverPosition(null);
        if (onNodeHover) onNodeHover(null, null);
      }

      // Increment and log no-hit counter for debugging
      setNoHitCounter((prev) => {
        const newCount = prev + 1;
        if (debug && newCount % 60 === 0) {
          // Log once per second at 60fps
          console.log(
            `No node found at position: (${dataPos.x.toFixed(2)}, ${dataPos.y.toFixed(2)})`,
          );
          console.log(`Cell: (${cellX}, ${cellY})`);
          console.log(`Number of consecutive frames with no hit: ${newCount}`);
        }
        return newCount;
      });
      return;
    }

    // Reset no-hit counter when we find candidates
    setNoHitCounter(0);

    // Find the closest node within the hit radius
    const hitRadiusSq = Math.pow(nodeScale * atlasScale * 2, 2); // Scaled hit radius
    let closestIdx = null;
    let closestDistSq = hitRadiusSq;

    for (const idx of candidateIndices) {
      const entry = data[idx];
      const dx = (entry.pos.x - dataPos.x) * atlasScale;
      const dy = (entry.pos.y - dataPos.y) * atlasScale;
      const distSq = dx * dx + dy * dy;

      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closestIdx = idx;
      }
    }

    // Notify when hover state changes
    if (closestIdx !== hoverIndex) {
      setHoverIndex(closestIdx);

      if (closestIdx !== null) {
        // Store the position of the hovered node for the highlight
        const nodePos = data[closestIdx].pos;
        const worldPos = new Vector3(
          (nodePos.x - center.x) * atlasScale,
          (nodePos.y - center.y) * atlasScale,
          0,
        );
        setHoverPosition(worldPos);

        if (onNodeHover)
          onNodeHover(data[closestIdx].path ?? closestIdx, closestIdx);

        if (debug) {
          console.log('Node found:', {
            id: data[closestIdx].path ?? closestIdx,
            index: closestIdx,
            position: data[closestIdx].pos.toArray(),
            distance: Math.sqrt(closestDistSq),
          });
        }
      } else {
        setHoverPosition(null);
        if (onNodeHover) onNodeHover(null, null);
        if (debug) {
          console.log('No node within hit radius');
        }
      }
    }
  });

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

      {/* Static triangle for the map center */}
      <mesh rotation={new Euler(0, 0, Math.PI)}>
        <Triangle size={nodeScale} />
        <meshBasicMaterial
          color={0xf6c99f}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Highlight triangle that follows the hovered node */}
      {hoverPosition && (
        <mesh position={hoverPosition} renderOrder={1}>
          <Triangle size={nodeScale * 1.2} />
          <meshBasicMaterial
            color={hoverColor}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  );
};

export default Nodes;
