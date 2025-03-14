import { useState, useMemo } from 'react';
import { Vector2, Vector3 } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { NodeData } from '../../utils/types';

export function useNodeHover({
  data,
  nodeScale,
  atlasScale,
  onNodeHover,
  debug = false,
}: {
  data: NodeData[];
  nodeScale: number;
  atlasScale: number;
  onNodeHover?: (nodeId: string | number | null, index: number | null) => void;
  debug?: boolean;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<Vector3 | null>(null);
  const [_noHitCounter, setNoHitCounter] = useState(0);
  const { camera, pointer } = useThree();

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
  }, [data, data.length, debug]);

  // Handle hover detection efficiently using spatial index
  useFrame(() => {
    if (data.length === 0) return;

    // Convert mouse coordinates to clip space (-1 to 1)
    const mouseX = pointer.x;
    const mouseY = pointer.y;

    // Project into world space
    const worldPos = new Vector3(mouseX, mouseY, 0);
    worldPos.unproject(camera);

    // Convert to data space coordinates - now using absolute coordinates
    const dataPos = new Vector2(
      worldPos.x / (atlasScale * 0.5),
      worldPos.y / (atlasScale * 0.5),
    );

    if (debug && Math.random() < 0.01) {
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
    const hitRadiusSq = Math.pow(nodeScale * atlasScale * 2, 2);
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
        // Store the position of the hovered node for the highlight using absolute coordinates
        const nodePos = data[closestIdx].pos;
        const worldPos = new Vector3(
          nodePos.x * atlasScale * 0.5,
          nodePos.y * atlasScale * 0.5,
          0,
        );
        setHoverPosition(worldPos);

        if (onNodeHover)
          onNodeHover(data[closestIdx].filepath ?? closestIdx, closestIdx);

        if (debug) {
          console.log('Node found:', {
            id: data[closestIdx].filepath ?? closestIdx,
            index: closestIdx,
            position: [data[closestIdx].pos.x, data[closestIdx].pos.y],
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

  return { hoverIndex, hoverPosition };
}
