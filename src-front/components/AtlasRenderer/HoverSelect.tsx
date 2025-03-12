import { memo, useEffect, useState } from 'react';
import { Vector2, Color } from 'three';
import { useThree } from '@react-three/fiber';
import Triangle from './Triangle';
import { emit } from '@tauri-apps/api/event';
import { useNodeHover } from './useNodeHover';
import { useMouseClick } from './useMouseClick';
import { NodeData } from '../../utils/types';
import { useAtlasStore } from '../../store/atlasStore';

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

    const { hoverPosition, hoverIndex } = useNodeHover({
      data,
      nodeScale,
      atlasScale,
      center,
      onNodeHover,
    });

    const atlas = useAtlasStore();

    const handleClick = async () => {
      if (hoverIndex !== null) {
        const active = data[hoverIndex];
        await emit('atlas:open', {
          node: active,
        });
        atlas.setActiveNode(active);
      }
    };

    const { handlers } = useMouseClick(handleClick);

    useEffect(() => {
      const canvas = gl.domElement;

      const handleMouseEnter = () => setIsMouseOverCanvas(true);
      const handleMouseLeave = () => setIsMouseOverCanvas(false);

      // Attach the mouse click handlers to the canvas
      const handlePointerDown = (e: any) => handlers.onPointerDown(e);
      const handlePointerMove = (e: any) => handlers.onPointerMove(e);
      const handlePointerUp = (e: any) => handlers.onPointerUp(e);

      canvas.addEventListener('mouseenter', handleMouseEnter);
      canvas.addEventListener('mouseleave', handleMouseLeave);
      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerup', handlePointerUp);

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
        canvas.removeEventListener('pointerdown', handlePointerDown);
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('pointerup', handlePointerUp);
      };
    }, [gl, handlers]);

    if (!hoverPosition || !isMouseOverCanvas) return null;

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

export default HoverSelect;
