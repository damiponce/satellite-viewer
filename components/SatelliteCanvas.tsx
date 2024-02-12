import React from 'react';
import * as THREE from 'three';
import dynamic from 'next/dynamic';
const DynamicCanvas = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  {
    ssr: false,
  },
);

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/redux/store';

import { OrbitControls, PerspectiveCamera, StatsGl } from '@react-three/drei';

import Earth from './Earth';
import Helpers from './Helpers';
import Satellite from './Satellite';
import Sun from './Sun';

export default function SatelliteCanvas({ timer }: { timer: any }) {
  const settings = useSelector((state: RootState) => state.settings);
  const satellites = useSelector((state: RootState) => state.satellites);
  const dispatch = useDispatch();

  // console.warn('SAT_CANVAS', satellites);
  return (
    <DynamicCanvas>
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
        far={500}
      />
      <ambientLight intensity={0.7} />
      <Sun timer={timer} />
      <OrbitControls enablePan={false} />
      <group rotation={[Math.PI / 2, 0, 0]}>
        <Earth />
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
    </DynamicCanvas>
  );
}
