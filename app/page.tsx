'use client';
import React, { StrictMode, Suspense, useLayoutEffect } from 'react';
import * as THREE from 'three';

import { store } from '@/lib/redux/store';
import { Provider } from 'react-redux';

import Overlay from '@/components/overlay/Overlay';
import SatelliteScene from '@/components/SatelliteScene';

import hypertimer from 'hypertimer';
import Timekeeper from '@/lib/Timekeeper';
import WelcomeDialog from '@/components/AlertDIalog';
import Loading from '@/components/overlay/Loading';

import { Canvas } from '@react-three/fiber';

export default function App() {
  // const [, forceUpdate] = React.useReducer((x) => -x, 0);

  const timer = React.useRef(
    hypertimer({
      rate: 1,
      time: Date.now(),
      paced: true,
    }),
  );

  useLayoutEffect(() => {
    THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);
  }, []);

  return (
    <StrictMode>
      <div id='canvas-container' className='overflow-hidden'>
        <Provider store={store}>
          <Suspense fallback={<Loading />}>
            {process.env.NODE_ENV !== 'development' && <WelcomeDialog />}
            <Canvas dpr={[1, 2]}>
              <SatelliteScene timer={timer} />
            </Canvas>
            <Overlay timer={timer} />
            <Timekeeper
              deltaMs={10}
              set={(t) => {
                timer.current = t;
                // forceUpdate();
              }}
            />
          </Suspense>
        </Provider>
      </div>
    </StrictMode>
  );
}
