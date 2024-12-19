'use client';
import React, { StrictMode, Suspense } from 'react';
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
import { getDB, isDBOld, updateDB } from '@/lib/actions/gp';
import { countJsonData, loadJsonData, saveJsonData } from '@/lib/idb/storage';
import { addSatellitesFromDB } from '@/lib/satellites/satelliteSlice';

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

  async function saveGPtoIDB() {
    return await getDB()
      .then((gp) => {
        gp.forEach((sat) => {
          sat.creation_date = new Date(sat.creation_date).getTime();
          sat.epoch = new Date(sat.epoch).getTime();
        });
        return gp;
      })
      .then(async (gp) => {
        if (true) console.debug('SAVING GP TO IndexedDB');
        await saveJsonData('gp', gp);
        if (true) console.debug('SAVED GP TO IndexedDB');
        if (true) console.debug(gp);
        return gp;
      });
  }

  React.useLayoutEffect(() => {
    THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);
    // return;
    loadJsonData('gp').then(async (data) => {
      if (!data) {
        if (true) console.debug('NO SATELLITES IN IndexedDB');
        dispatch(addSatellitesFromDB(await saveGPtoIDB()));
      } else {
        if (false) console.debug('SATELLITES IN IndexedDB');
        dispatch(addSatellitesFromDB(data));
      }
    });

    //   // isDBRecent().then((res) => {
    //   //   console.log('isDBRecent?', res);
    //   //   getDB().then((gp) => {
    //   //     console.log(gp);
    //   //   });
    //   // });
  });

  return (
    // <Suspense fallback={<Loading />}>
    <>
      {process.env.NODE_ENV !== 'development' && <WelcomeDialog />}
      <Canvas dpr={[1, 3]} gl={{}}>
        <SatelliteScene timer={timer} />
      </Canvas>
      {/* <Overlay timer={timer} /> */}
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
      <div id='canvas-container' className='overflow-hidden'>
        <Provider store={store}>
          <LoadingProvider>
            <WrappedApp />
          </LoadingProvider>
        </Provider>
      </div>
    </StrictMode>
  );
}
