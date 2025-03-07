import { memo } from 'react';
import { Vector2, Color } from 'three';
import Triangle from './Triangle';
import { useNodeHover, NodeData } from './useNodeHover';

interface HoverHighlightProps {
  data: NodeData[];
  nodeScale: number;
  atlasScale: number;
  center: Vector2;
  hoverColor: Color;
  onNodeHover?: (nodeId: string | number | null, index: number | null) => void;
  debug?: boolean;
}

const HoverHighlight = memo(
  ({
    data,
    nodeScale,
    atlasScale,
    center,
    hoverColor,
    onNodeHover,
    debug = false,
  }: HoverHighlightProps) => {
    const { hoverPosition } = useNodeHover({
      data,
      nodeScale,
      atlasScale,
      center,
      onNodeHover,
      debug,
    });

    if (!hoverPosition) return null;

    return (
      <mesh position={hoverPosition} renderOrder={1}>
        <Triangle size={nodeScale * 1.2} />
        <meshBasicMaterial
          color={hoverColor}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    );
  },
);

export default HoverHighlight;
