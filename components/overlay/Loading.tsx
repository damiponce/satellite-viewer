import React from 'react';

export default function Loading() {
  return (
    <div className='absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 text-white z-[1000]'>
      <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[2]'>
        <h2 className='text-6xl font-bold text-center'>SatView</h2>
        <h3 className='text-xs font-mono text-center text-red-500/75 '>
          [WORK IN PROGRESS]
        </h3>
      </div>
      <div className='absolute bottom-[7vh] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[2] text-center'>
        <h2 className='text-normal font-medium '>Loading assets...</h2>
        <h3 className='text-xs font-normal text-zinc-400 '>Please wait :3</h3>
      </div>
      <div className='absolute inset-0 bg-zinc-950 z-[1] animate-pulse' />
    </div>
  );
}
