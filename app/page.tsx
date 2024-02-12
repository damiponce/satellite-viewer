'use client';
import React, { StrictMode, useLayoutEffect } from 'react';
import * as THREE from 'three';

import { store } from '@/lib/redux/store';
import { Provider } from 'react-redux';

import Overlay from '@/components/Overlay';
import SatelliteCanvas from '@/components/SatelliteCanvas';

import hypertimer from 'hypertimer';
import Timekeeper from '@/lib/Timekeeper';
import WelcomeDialog from '@/components/AlertDIalog';

export default function App() {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const timer = React.useRef(
    hypertimer({
      rate: 1000,
      time: Date.now(),
      paced: true,
    }),
  );

  useLayoutEffect(() => {
    THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);
  }, []);

  return (
    <div id='canvas-container' className='overflow-hidden'>
      <StrictMode>
        <Provider store={store}>
          <WelcomeDialog />
          <SatelliteCanvas timer={timer.current} />
          <Overlay timer={timer.current} />
          <Timekeeper
            deltaMs={10}
            set={(t) => {
              timer.current = t;
              // forceUpdate();
            }}
          />
        </Provider>
      </StrictMode>
    </div>
  );
}
