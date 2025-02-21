import { FC } from 'react';
//
import { useAtlasStore } from '../../store/atlasStore';

interface AtlasRendererProps {}

const AtlasRenderer: FC<AtlasRendererProps> = () => {
  const atlas = useAtlasStore();
  return <div className='h-full w-full rounded-md bg-neutral-900'></div>;
};
export default AtlasRenderer;
