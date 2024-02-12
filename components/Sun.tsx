import React from 'react';
import { useFrame } from '@react-three/fiber';

import * as satellite from 'satellite.js';
import * as THREE from 'three';
const SunCalc = require('suncalc');

export default function Sun({ timer }: { timer: any }) {
  const [sunCartesian, setSunCartesian] = React.useState(new THREE.Vector3());

  useFrame(() => {
    const sun_geodetic = SunCalc.getPosition(timer.now(), 89.8, 0);
    const sun_cartesian = satellite.geodeticToEcf({
      longitude: -sun_geodetic.azimuth,
      latitude: sun_geodetic.altitude,
      height: 0,
    });
    setSunCartesian(
      new THREE.Vector3(sun_cartesian.x, sun_cartesian.y, sun_cartesian.z),
    );
  });

  return (
    <>
      <directionalLight color='white' position={sunCartesian} intensity={5} />
    </>
  );
}
