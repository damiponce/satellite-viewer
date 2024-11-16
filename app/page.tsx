'use client';
import React, { StrictMode, Suspense } from 'react';
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
import { getDB, isDBRecent } from '@/lib/actions/gp';
import { loadJsonData, saveJsonData } from '@/lib/idb/storage';
import { addSatelliteFromDB } from '@/lib/satellites/satelliteSlice';

export default function App() {
  // const [, forceUpdate] = React.useReducer((x) => -x, 0);

  const timer = React.useRef(
    hypertimer({
      rate: 1,
      time: Date.now(),
      paced: true,
    }),
  );

  React.useLayoutEffect(() => {
    THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);
  }, []);

  async function saveGPtoIDB() {
    return await getDB().then(async (gp) => {
      console.log('SAVING GP TO IDB');
      await saveJsonData('gp', gp);
      console.log('SAVED GP TO IDB');
      console.log(gp);
      return gp;
    });
  }

  // React.useLayoutEffect(() => {
  //   loadJsonData('satellites').then(async (data) => {
  //     if (!data) {
  //       console.log('NO SATELLITES IN IDB');
  //       store.dispatch(addSatelliteFromDB(await saveGPtoIDB()));
  //     } else {
  //       console.log('SATELLITES IN IDB');

  //       // store.dispatch(addSatelliteFromDB(data));
  //     }
  //   });

  //   // isDBRecent().then((res) => {
  //   //   console.log('isDBRecent?', res);
  //   //   getDB().then((gp) => {
  //   //     console.log(gp);
  //   //   });
  //   // });
  // });

  // React.useEffect(() => {
  //   fetchSatellites('starlink').then((satellites) => {
  //     console.log(satellites);
  //   });
  // }, []);

  return (
    <StrictMode>
      <div id='canvas-container' className='overflow-hidden'>
        <Provider store={store}>
          <Suspense fallback={<Loading />}>
            {process.env.NODE_ENV !== 'development' && <WelcomeDialog />}
            <Canvas dpr={[1, 1]}>
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
