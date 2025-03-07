import { type FC, useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { MapControls, OrthographicCamera } from '@react-three/drei';
import { Vector2, OrthographicCamera as ThreeOrthographicCamera } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface AtlasControlsProps {
  bounds: Vector2;
}

const AtlasControls: FC<AtlasControlsProps> = ({ bounds }) => {
  const ref = useRef<OrbitControlsImpl>(null!);
  const { camera, size } = useThree();
  const orthoCam = camera as ThreeOrthographicCamera;

  // Calculate optimal zoom based on bounds and viewport size
  const calculateOptimalZoom = () => {
    // Since width is typically greater, we only use width for zoom calculation
    // This ensures content matches the wider dimension (usually width)
    return size.width / (bounds.x * 2);
  };

  const handleChange = () => {
    if (!bounds) return;

    // Calculate visible area dimensions based on current zoom
    const visibleWidth = size.width / orthoCam.zoom;
    const visibleHeight = size.height / orthoCam.zoom;

    // Calculate maximum allowed positions to keep the camera within bounds
    const maxX = bounds.x - visibleWidth / 2;
    const maxY = bounds.y - visibleHeight / 2;

    // Don't allow panning beyond bounds
    camera.position.x = Math.max(-maxX, Math.min(maxX, camera.position.x));
    camera.position.y = Math.max(-maxY, Math.min(maxY, camera.position.y));

    // Update target to match camera position to avoid rubber-band effects
    ref.current.target.x = camera.position.x;
    ref.current.target.y = camera.position.y;
  };

  // Set initial zoom and handle resizes
  useEffect(() => {
    // Calculate dynamic zoom range
    const dynamicMinZoom = calculateOptimalZoom();
    const dynamicMaxZoom = dynamicMinZoom * 10;

    // Set initial zoom to middle of the range
    const initialZoom = (dynamicMinZoom + dynamicMaxZoom) / 2;
    orthoCam.zoom = initialZoom;
    orthoCam.updateProjectionMatrix();

    // Apply constraints immediately
    handleChange();

    // Handler for window resize
    const handleResize = () => {
      const newDynamicMinZoom = calculateOptimalZoom();
      const newDynamicMaxZoom = newDynamicMinZoom * 10;
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

  const dynamicMinZoom = size.width / (bounds.x * 2);
  const dynamicMaxZoom = dynamicMinZoom * 10;
  const initialZoom = (dynamicMinZoom + dynamicMaxZoom) / 2;

  return (
    <>
      <MapControls
        ref={ref}
        minZoom={dynamicMinZoom}
        maxZoom={dynamicMaxZoom}
        enableRotate={false}
        screenSpacePanning={true}
        onChange={handleChange}
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
