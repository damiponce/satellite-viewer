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
import Loading from '@/components/overlay/Loading';

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

  React.useLayoutEffect(() => {
    THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);
  }, []);

  async function saveGPtoIDB() {
    return await getDB().then(async (gp) => {
      console.log('SAVING GP TO IndexedDB');
      await saveJsonData('gp', gp);
      console.log('SAVED GP TO IndexedDB');
      console.log(gp);
      return gp;
    });
  }

  React.useLayoutEffect(() => {
    // return;
    loadJsonData('gp').then(async (data) => {
      if (!data) {
        console.log('NO SATELLITES IN IndexedDB');
        dispatch(addSatellitesFromDB(await saveGPtoIDB()));
      } else {
        console.log('SATELLITES IN IndexedDB');
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

  // React.useEffect(() => {
  //   fetchSatellites('starlink').then((satellites) => {
  //     console.log(satellites);
  //   });
  // }, []);

  return (
    <Suspense fallback={<Loading />}>
      {process.env.NODE_ENV !== 'development' && <WelcomeDialog />}
      <Canvas dpr={[1, 1]} gl={{}}>
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
  );
}

export default function App() {
  return (
    <StrictMode>
      <div id='canvas-container' className='overflow-hidden'>
        <Provider store={store}>
          <WrappedApp />
        </Provider>
      </div>
    </StrictMode>
  );
}
