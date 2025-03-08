import { memo, useEffect, useState } from 'react';
import { Vector2, Color } from 'three';
import { useThree } from '@react-three/fiber';
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
    const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false);
    const { gl } = useThree();

    useEffect(() => {
      const canvas = gl.domElement;

      const handleMouseEnter = () => setIsMouseOverCanvas(true);
      const handleMouseLeave = () => setIsMouseOverCanvas(false);

      canvas.addEventListener('mouseenter', handleMouseEnter);
      canvas.addEventListener('mouseleave', handleMouseLeave);

      // Initialize state based on whether mouse is already over canvas
      const rect = canvas.getBoundingClientRect();
      const { clientX, clientY } = new MouseEvent('mousemove');
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        setIsMouseOverCanvas(true);
      }

      return () => {
        canvas.removeEventListener('mouseenter', handleMouseEnter);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, [gl]);

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

    if (!hoverPosition || !isMouseOverCanvas) return null;

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
