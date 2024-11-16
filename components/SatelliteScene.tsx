import React, { Suspense } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/redux/store';

import * as THREE from 'three';
import { Bvh, PerspectiveCamera, StatsGl, useTexture } from '@react-three/drei';

import Earth from './earth/Earth';
import Helpers from './Helpers';
import Satellite from './Satellite';
import Sun from './Sun';
import EarthControls from './EarthControls';
import SatelliteDots from './SatelliteDots';
import { twoline2satrec } from 'satellite.js';

export default function SatelliteScene({ timer }: { timer: any }) {
  const satellites = useSelector((state: RootState) => state.satellites);

  // console.warn('SAT_CANVAS', satellites);

  // <Suspense fallback={<Loading />}>
  // <DynamicCanvas>

  const satellitesRecs = satellites
    .slice(0, satellites.length / 2)
    .map((sat) => twoline2satrec(sat.tle1, sat.tle2));

  return (
    <Bvh>
      <PerspectiveCamera
        makeDefault={true}
        position={[40, 40, 40]}
        fov={30}
        aspect={
          typeof window === 'undefined'
            ? 1
            : window.innerWidth / window.innerHeight
        }
        near={0.1}
        far={50000}
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

      <SatelliteDots data={satellitesRecs} timer={timer} />

      {false && <StatsGl />}
    </Bvh>
  );
}
