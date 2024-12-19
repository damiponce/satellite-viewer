import React, { StrictMode } from 'react';

import Overlay from '@/components/overlay/Overlay';
import Timekeeper from '@/lib/Timekeeper';

import hypertimer from 'hypertimer';

export default function Page() {
  // const [, forceUpdate] = React.useReducer((x) => -x, 0);

  // const timer = React.useRef(
  //   hypertimer({
  //     rate: 1,
  //     time: Date.now(),
  //     paced: true,
  //   }),
  // );
  return (
    <StrictMode>
      <div id='canvas-container' className='overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 text-white z-[1000]'>
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[2]'>
            <h2 className='text-6xl font-bold text-center'>SatView</h2>
            <h3 className='text-xs font-mono text-center text-red-500/75 '>
              [WORK IN PROGRESS]
            </h3>
          </div>
          <div className='absolute bottom-[7vh] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[2] text-center'>
            <div className='text-normal font-medium'>
              {['Loading assets', 'Loading satellites'].map((task) => (
                <h2>{task}</h2>
              ))}
            </div>
            <h3 className='text-xs font-normal text-zinc-400 '>
              Please wait :3
            </h3>
          </div>
          <div className='absolute inset-0 bg-zinc-950 z-[1] animate-pulse' />
        </div>
      </div>
    </StrictMode>
  );

  // return (
  //   <Provider store={store}>
  //     <Overlay timer={timer} />
  //     <Timekeeper
  //       deltaMs={10}
  //       set={(t) => {
  //         timer.current = t;
  //         forceUpdate();
  //       }}
  //     />
  //   </Provider>
  // );
}
