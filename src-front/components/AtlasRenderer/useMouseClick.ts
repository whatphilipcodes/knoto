import { useState, useRef, useCallback } from 'react';

type PointerEvent = React.PointerEvent<any>;

/**
 * Hook that detects clicks without drag
 * @param onClick Function to call when a click without drag is detected
 * @param dragThreshold Pixel distance to consider as a drag
 */
const useMouseClick = (onClick: () => void, dragThreshold = 5) => {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = useCallback((e: PointerEvent) => {
    startPosRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(false);
  }, []);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!startPosRef.current) return;

      // Consider it a drag if moved more than the threshold in any direction
      const dx = Math.abs(e.clientX - startPosRef.current.x);
      const dy = Math.abs(e.clientY - startPosRef.current.y);

      if (dx > dragThreshold || dy > dragThreshold) {
        setIsDragging(true);
      }
    },
    [dragThreshold],
  );

  const handlePointerUp = useCallback(
    (_e: PointerEvent) => {
      if (!isDragging && startPosRef.current) {
        onClick();
      }
      startPosRef.current = null;
    },
    [isDragging, onClick],
  );

  return {
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
    isDragging,
  };
};
export default useMouseClick;
