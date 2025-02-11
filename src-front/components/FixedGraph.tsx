import { /*useEffect,*/ useRef } from 'react';
// import * as d3 from 'd3';

const FixedGraph = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // const getDimensions = () => {
  //   const width = wrapperRef.current?.getBoundingClientRect().width || 0;
  //   const height = wrapperRef.current?.getBoundingClientRect().height || 0;
  //   return { width, height };
  // };

  // const updateDims = () => {
  //   const { width, height } = getDimensions();
  //   svgRef.attr('viewBox', `0 0 ${width} ${height}`);
  //   const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
  //   const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
  // };

  return (
    <div ref={wrapperRef} className='h-full w-full'>
      <svg ref={svgRef} className='bg-neutral-700' />
    </div>
  );
};

export default FixedGraph;
