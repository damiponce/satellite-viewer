'use client';
import React, { StrictMode } from 'react';
import * as THREE from 'three';

import { store } from '@/lib/redux/store';
import { Provider, useDispatch } from 'react-redux';

import Overlay from '@/components/overlay/Overlay';
import SatelliteScene from '@/components/SatelliteScene';

import hypertimer from 'hypertimer';
import Timekeeper from '@/lib/Timekeeper';
import WelcomeDialog from '@/components/AlertDIalog';
import { LoadingProvider } from '@/components/LoadingScreen';

import { Canvas } from '@react-three/fiber';
import { loadData } from '@/lib/loadData';
import TimeHandlerThree from '@/components/overlay/TimeHandlerThree';
import TimelineThree from '@/components/overlay/TimelineThree';
import { Bloom, EffectComposer } from '@react-three/postprocessing';

function WrappedApp() {
  // const [, forceUpdate] = React.useReducer((x) => -x, 0);

  const dispatch = useDispatch();

  const timer = React.useRef(
    hypertimer({
      rate: 1,
      time: Date.now(),
      paced: true,
    }),
  );

  React.useLayoutEffect(() => {
    THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);
    if (typeof window !== 'undefined') {
      loadData(dispatch);
    }
  });

  return (
    // <Suspense fallback={<Loading />}>
    <>
      {process.env.NODE_ENV !== 'development' && <WelcomeDialog />}
      <Canvas dpr={[1, 3]} gl={{}}>
        <SatelliteScene timer={timer} />
        <TimeHandlerThree timer={timer} />
        {/* <TimelineThree timer={timer} /> */}
      </Canvas>
      <Overlay timer={timer} />
      <Timekeeper
        deltaMs={10}
        set={(t) => {
          timer.current = t;
          // forceUpdate();
        }}
      />
    </>
    // </Suspense>
  );
}

export default function App() {
  return (
    <StrictMode>
      <Provider store={store}>
        <div id='canvas-container' className='overflow-hidden'>
          <LoadingProvider>
            <WrappedApp />
          </LoadingProvider>
        </div>
      </Provider>
    </StrictMode>
  );
}
