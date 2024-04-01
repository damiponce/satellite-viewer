import React, { Suspense, use } from 'react';
import * as THREE from 'three';
import dynamic from 'next/dynamic';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/redux/store';

import {
  Bvh,
  Effects,
  OrbitControls,
  PerspectiveCamera,
  StatsGl,
  useTexture,
} from '@react-three/drei';

import Earth from './Earth';
import Helpers from './Helpers';
import Satellite from './Satellite';
import Sun from './Sun';
import { useFrame, useThree } from '@react-three/fiber';
import EarthControls from './EarthControls';
import Loading from './overlay/Loading';
import { EffectComposer, LensFlare } from '@react-three/postprocessing';

export default function SatelliteCanvas({ timer }: { timer: any }) {
  const textures = useTexture({
    albedoMap: '/earth/Albedo.jpg',
    bumpMap: '/earth/Bump.jpg',
    oceanMap: '/earth/Ocean.png',
    lightsMap: '/earth/night_lights_modified.png',
    // envMap: '/earth/starmap_2020_16k.jpg',
  });

  const settings = useSelector((state: RootState) => state.settings);
  const satellites = useSelector((state: RootState) => state.satellites);
  const dispatch = useDispatch();

  // console.warn('SAT_CANVAS', satellites);

  // <Suspense fallback={<Loading />}>
  // <DynamicCanvas>
  return (
    <Bvh>
      <PerspectiveCamera
        makeDefault
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
        <Earth textures={textures} />
      </group>
      {satellites.map((satellite) => (
        <Satellite
          key={`satellite-${satellite.noradId}`}
          data={satellite}
          timer={timer}
        />
      ))}
      <Helpers />
      {false && <StatsGl />}
    </Bvh>
  );
}
