import { type FC, useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { MapControls, OrthographicCamera } from '@react-three/drei';
import {
  Vector2Like,
  OrthographicCamera as ThreeOrthographicCamera,
} from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface AtlasControlsProps {
  bounds: Vector2Like;
  maxZoom?: number;
  initialZoom?: number;
}

const AtlasControls: FC<AtlasControlsProps> = ({
  bounds,
  maxZoom = 100,
  initialZoom = 20,
}) => {
  const ref = useRef<OrbitControlsImpl>(null!);
  const { camera, size } = useThree();
  const orthoCam = camera as ThreeOrthographicCamera;

  // Calculate optimal zoom based on bounds and viewport size
  const calculateOptimalZoom = () => {
    // Calculate zoom factors for both dimensions
    const widthZoomFactor = size.width / (bounds.x * 2);
    const heightZoomFactor = size.height / (bounds.y * 2);

    // Use the smaller zoom factor to ensure entire content is visible
    return Math.max(widthZoomFactor, heightZoomFactor);
  };

  const handleChange = () => {
    if (!bounds) return;

    // Enforce minimum zoom to prevent seeing beyond bounds
    const minZoom = calculateOptimalZoom();
    if (orthoCam.zoom < minZoom) {
      orthoCam.zoom = minZoom;
      orthoCam.updateProjectionMatrix();
    }

    // Calculate visible area dimensions based on current zoom
    const visibleWidth = size.width / orthoCam.zoom;
    const visibleHeight = size.height / orthoCam.zoom;

    // Calculate maximum allowed positions to keep the camera within bounds
    const maxX = Math.max(0, bounds.x - visibleWidth / 2);
    const maxY = Math.max(0, bounds.y - visibleHeight / 2);

    // Don't allow panning beyond bounds
    camera.position.x = Math.max(-maxX, Math.min(maxX, camera.position.x));
    camera.position.y = Math.max(-maxY, Math.min(maxY, camera.position.y));

    // Update target to match camera position to avoid rubber-band effects
    ref.current.target.x = camera.position.x;
    ref.current.target.y = camera.position.y;
  };

  // Set initial zoom and handle resizes
  useEffect(() => {
    // Removed forced middle zoom
    handleChange();

    // Handler for window resize
    const handleResize = () => {
      const newDynamicMinZoom = calculateOptimalZoom();
      const newDynamicMaxZoom = newDynamicMinZoom * 10;

      // Ensure camera zoom is still within valid range after resize
      orthoCam.zoom = Math.min(
        Math.max(orthoCam.zoom, newDynamicMinZoom),
        newDynamicMaxZoom,
      );
      orthoCam.updateProjectionMatrix();
      handleChange();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [bounds, size.width, size.height]);

  const dynamicMinZoom = calculateOptimalZoom();

  return (
    <>
      <MapControls
        ref={ref}
        minZoom={dynamicMinZoom}
        maxZoom={maxZoom}
        enableRotate={false}
        screenSpacePanning={true}
        onChange={handleChange}
        onStart={() => handleChange()} // Also enforce constraints when interaction starts
        onEnd={() => handleChange()} // And when interaction ends
      />
      <OrthographicCamera
        makeDefault
        position={[0, 0, 1]}
        zoom={initialZoom}
        near={0.1}
        far={1}
      />
    </>
  );
};
export default AtlasControls;
