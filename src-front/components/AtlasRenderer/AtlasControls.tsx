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
  minZoom = 1,
  maxZoom = 100,
  startZoom = 5,
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

    console.log('camera: ', orthoCam.position);
    console.log('zoom: ', orthoCam.zoom);
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
        position={[0, 0, 1]}
        zoom={startZoom}
        near={0.1}
        far={1}
      />
    </>
  );
};
export default AtlasControls;
