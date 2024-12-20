import React, { Suspense, useEffect, useLayoutEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/redux/store';

import * as THREE from 'three';
import { Bvh, PerspectiveCamera, StatsGl, useTexture } from '@react-three/drei';

import Earth from './earth/Earth';
import Helpers from './Helpers';
import Sun from './Sun';
import EarthControls from './EarthControls';
import SatelliteDots from './SatelliteDots';
import { SatRec, twoline2satrec } from 'satellite.js';

export default function SatelliteScene({ timer }: { timer: any }) {
  const satellites = useSelector((state: RootState) => state.satellites);
  const [satTles, setSatTles] = React.useState<string[]>([]);
  // console.warn('SAT_CANVAS', satellites);

  // <Suspense fallback={<Loading />}>
  // <DynamicCanvas>

  useEffect(() => {
    setSatTles(
      satellites
        .slice(0, satellites.length / 1)
        .map((sat) => `${sat.tle_line0}\n${sat.tle_line1}\n${sat.tle_line2}`),
    );
  }, [satellites]);

  return (
    <Bvh>
      <PerspectiveCamera
        makeDefault={true}
        position={[40, 40, 40]}
        fov={20}
        aspect={
          typeof window === 'undefined'
            ? 1
            : window.innerWidth / window.innerHeight
        }
        near={0.1}
        far={50000000}
      />
      <ambientLight intensity={0.05} />
      <Sun timer={timer} />
      <EarthControls />
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* <Earth textures={textures} /> */}
        {/* <Suspense fallback={null}> */}
        <Earth />
        {/* </Suspense> */}
        <Helpers />
      </group>
      {/* {satellites.map((satellite) => (
        <Satellite
          key={`satellite-${satellite.noradId}`}
          data={satellite}
          timer={timer}
        />
      ))} */}

      <SatelliteDots data={satTles} timer={timer} />

      {false && <StatsGl />}
    </Bvh>
  );
}
