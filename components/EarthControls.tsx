import { CameraControls, OrbitControls } from '@react-three/drei';
import React from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EARTH_MEAN_RADIUS } from '@/utils/constants';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { parseFloatAuto } from '@/lib/utils';
import {
  OrbitControls as _OrbitControls,
  TrackballControls as _TrackballControls,
} from 'three-stdlib';

export default function EarthControls() {
  const orbitRef = React.useRef<_OrbitControls>(null!);
  const trackballRef = React.useRef<_TrackballControls>(null!);
  const cameraControlsRef = React.useRef<CameraControls>(null);

  const selections = useSelector((state: RootState) => state.selections);

  // React.useEffect(() => {
  //   console.log(orbitRef, trackballRef);
  //   if (selections.focused.id === null) {
  //     orbitRef.current!.up = new THREE.Vector3(0, 0, 1);
  //     orbitRef.current?.update();
  //   }
  // }, [selections.focused.id]);

  useFrame(() => {
    if (cameraControlsRef.current === null) return;

    if (selections.focused.id === null) {
      cameraControlsRef.current.moveTo(0, 0, 0, true);
    } else {
      cameraControlsRef.current.moveTo(
        parseFloatAuto(selections.focused.posEc.x),
        parseFloatAuto(selections.focused.posEc.y),
        parseFloatAuto(selections.focused.posEc.z),
        true,
      );
      // let currentPosition: THREE.Vector3 = new THREE.Vector3();
      // cameraControlsRef.current.getPosition(currentPosition)
      // cameraControlsRef.current.setPosition(
      //   currentPosition.x  +         parseFloatAuto(selections.focused.posEc.x),
      //   currentPosition.y +         parseFloatAuto(selections.focused.posEc.y),
      //   currentPosition.z +         parseFloatAuto(selections.focused.posEc.z),
      // )
    }
  });

  return <CameraControls ref={cameraControlsRef} />;

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
          ref={orbitRef}
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
