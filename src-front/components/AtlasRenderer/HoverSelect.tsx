import { memo } from 'react';
import { Vector2, Color } from 'three';
import Triangle from './Triangle';
//
import { emit } from '@tauri-apps/api/event';
//
import { useNodeHover, NodeData } from './useNodeHover';
import { useMouseClick } from './useMouseClick';

interface HoverSelectProps {
  data: NodeData[];
  nodeScale: number;
  atlasScale: number;
  center: Vector2;
  hoverColor: Color;
  onNodeHover?: (nodeId: string | number | null, index: number | null) => void;
}

const HoverSelect = memo(
  ({
    data,
    nodeScale,
    atlasScale,
    center,
    hoverColor,
    onNodeHover,
  }: HoverSelectProps) => {
    const { hoverPosition, hoverIndex } = useNodeHover({
      data,
      nodeScale,
      atlasScale,
      center,
      onNodeHover,
    });

    const handleClick = () => {
      emit('atlas:open', {
        file: hoverIndex ? data[hoverIndex].path : undefined,
      });
    };
    const { handlers } = useMouseClick(handleClick);

    if (!hoverPosition) return null;

    return (
      <mesh position={hoverPosition} renderOrder={1} {...handlers}>
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

export default HoverSelect;
