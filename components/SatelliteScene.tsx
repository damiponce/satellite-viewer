import React from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/redux/store';

import { Bvh, PerspectiveCamera, StatsGl, useTexture } from '@react-three/drei';

import Earth from './Earth';
import Helpers from './Helpers';
import Satellite from './Satellite';
import Sun from './Sun';
import EarthControls from './EarthControls';

export default function SatelliteScene({ timer }: { timer: any }) {
  const textures = useTexture({
    albedoMap: '/earth/Albedo.jpg',
    bumpMap: '/earth/Bump.jpg',
    oceanMap: '/earth/Ocean.png',
    lightsMap: '/earth/night_lights_modified.png',
    // envMap: '/earth/starmap_2020_16k.jpg',
  });

  const satellites = useSelector((state: RootState) => state.satellites);

  // console.warn('SAT_CANVAS', satellites);

  // <Suspense fallback={<Loading />}>
  // <DynamicCanvas>

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
      {false ? (
        <ArcballOrbitControls trackballRadius={EARTH_MEAN_RADIUS} />
      ) : (
        <EarthControls />
      )}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <Earth textures={textures} />
        <Helpers />
      </group>
      {satellites.map((satellite) => (
        <Satellite
          key={`satellite-${satellite.noradId}`}
          data={satellite}
          timer={timer}
        />
      ))}
      {false && <StatsGl />}
    </Bvh>
  );
}
