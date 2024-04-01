import { OrbitControls, TrackballControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import React, { Suspense } from 'react';
import * as THREE from 'three';
import Loading from './overlay/Loading';
import { EARTH_MEAN_RADIUS } from '@/utils/constants';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { parseFloatAuto } from '@/lib/utils';

export default function EarthControls() {
  const orbitRef = React.useRef<any>(null);
  const trackballRef = React.useRef<any>(null);

  const selections = useSelector((state: RootState) => state.selections);

  // React.useEffect(() => {
  //   console.log(orbitRef, trackballRef);
  //   if (selections.focused.id === null) {
  //     orbitRef.current!.up = new THREE.Vector3(0, 0, 1);
  //     orbitRef.current?.update();
  //   }
  // }, [selections.focused.id]);

  return (
    <>
      {selections.focused.id === null ? (
        <OrbitControls
          ref={orbitRef}
          enablePan={false}
          minDistance={EARTH_MEAN_RADIUS * 1.2}
          maxDistance={EARTH_MEAN_RADIUS * 50}
          target={[0, 0, 0]}
        />
      ) : (
        <OrbitControls
          ref={trackballRef}
          enablePan={false} // disable when trackball
          minDistance={EARTH_MEAN_RADIUS * 0.2}
          maxDistance={EARTH_MEAN_RADIUS * 50}
          target={
            new THREE.Vector3(
              parseFloatAuto(selections.focused.posEc.x),
              parseFloatAuto(selections.focused.posEc.y),
              parseFloatAuto(selections.focused.posEc.z),
            )
          }
        />
      )}
    </>
  );
}
