import React, { Suspense, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';

import * as satellite from 'satellite.js';
import * as THREE from 'three';
import { Effects } from '@react-three/drei';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  GodRays,
  LensFlare,
} from '@react-three/postprocessing';

const SunCalc = require('suncalc');

export default function Sun({ timer }: { timer: any }) {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const [sunCartesian, setSunCartesian] = React.useState(new THREE.Vector3());

  useFrame(() => {
    const sun_geodetic = SunCalc.getPosition(timer.current.now(), 89.8, 0);
    const sun_cartesian = satellite.geodeticToEcf({
      longitude: -sun_geodetic.azimuth,
      latitude: sun_geodetic.altitude,
      height: 0,
    });
    // setSunCartesian(
    //   new THREE.Vector3(sun_cartesian.x, sun_cartesian.y, sun_cartesian.z),
    // );
    sunRef.current?.position.set(
      sun_cartesian.x,
      sun_cartesian.y,
      sun_cartesian.z,
    );

    // console.log('SUN', sun_geodetic, sun_cartesian);
  });

  return (
    <>
      <directionalLight color='white' ref={sunRef} intensity={2} />
      {/* <mesh position={sunCartesian.normalize().multiplyScalar(5000)}>
        <sphereGeometry args={[10, 8, 8]} />
        <meshBasicMaterial color='yellow' />
      </mesh> */}
      {/* 
      <EffectComposer>
        <LensFlare />
      </EffectComposer> */}
    </>
  );
}
