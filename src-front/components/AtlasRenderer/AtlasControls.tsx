import { type FC, useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { MapControls, OrthographicCamera } from '@react-three/drei';
import { Vector2, OrthographicCamera as ThreeOrthographicCamera } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface AtlasControlsProps {
  bounds?: Vector2;
  minZoom?: number;
  maxZoom?: number;
  startZoom?: number;
}

const AtlasControls: FC<AtlasControlsProps> = ({
  bounds = new Vector2(100, 100),
  minZoom = 10,
  maxZoom = 100,
  startZoom = 50,
}) => {
  const ref = useRef<OrbitControlsImpl>(null!);
  const { camera, size } = useThree();
  const orthoCam = camera as ThreeOrthographicCamera;

  const handleChange = () => {
    if (!bounds) return;

    // Calculate visible area dimensions based on current zoom
    const visibleWidth = size.width / orthoCam.zoom;
    const visibleHeight = size.height / orthoCam.zoom;

    // Calculate maximum allowed positions to keep the camera within bounds
    const maxX = bounds.x - visibleWidth / 2;
    const maxY = bounds.y - visibleHeight / 2;

    // Constrain camera position
    if (camera.position.x > maxX) {
      camera.position.x = maxX;
      ref.current.target.x = maxX;
    } else if (camera.position.x < -maxX) {
      camera.position.x = -maxX;
      ref.current.target.x = -maxX;
    }

    if (camera.position.y > maxY) {
      camera.position.y = maxY;
      ref.current.target.y = maxY;
    } else if (camera.position.y < -maxY) {
      camera.position.y = -maxY;
      ref.current.target.y = -maxY;
    }
  };

  // Update bounds when zoom changes
  useEffect(() => {
    if (bounds) {
      handleChange();
    }
  }, [orthoCam.zoom, bounds]);

  return (
    <>
      <MapControls
        ref={ref}
        minZoom={minZoom}
        maxZoom={maxZoom}
        enableRotate={false}
        screenSpacePanning={true}
        onChange={handleChange}
      />
      <OrthographicCamera
        makeDefault
        position={[0, 0, 10]}
        zoom={startZoom}
        far={maxZoom}
        near={minZoom}
      />
    </>
  );
};
export default AtlasControls;
