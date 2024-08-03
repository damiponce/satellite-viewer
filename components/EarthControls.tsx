<<<<<<< Updated upstream
import { OrbitControls } from '@react-three/drei';
import React from 'react';
=======
import {
  ArcballControls,
  CameraControls,
  OrbitControls,
  TrackballControls,
} from '@react-three/drei';
import { extend, useFrame, useThree } from '@react-three/fiber';
import React, { RefAttributes, Suspense } from 'react';
>>>>>>> Stashed changes
import * as THREE from 'three';
import { EARTH_MEAN_RADIUS } from '@/utils/constants';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { parseFloatAuto } from '@/lib/utils';
import {
  ArcballControls as _ArcballControls,
  OrbitControls as _OrbitControls,
  TrackballControls as _TrackballControls,
} from 'three-stdlib';

export default function EarthControls() {
  const orbitRef = React.useRef<_OrbitControls>(null!);
<<<<<<< Updated upstream
  const trackballRef = React.useRef<_TrackballControls>(null!);
=======
  const arcballRef = React.useRef<_ArcballControls>(null!);
  const trackballRef = React.useRef<_TrackballControls>(null!);
  const cameraControlsRef = React.useRef<CameraControls>(null!);
>>>>>>> Stashed changes

  const selections = useSelector((state: RootState) => state.selections);

  // React.useEffect(() => {
  //   console.log(orbitRef, trackballRef);
  //   if (selections.focused.id === null) {
  //     orbitRef.current!.up = new THREE.Vector3(0, 0, 1);
  //     orbitRef.current?.update();
  //   }
  // }, [selections.focused.id]);

  useFrame(({ camera }) => {
    if (arcballRef.current) {
      // console.log(arcballRef.current);
      // // Set the camera's up vector to prevent z-axis rotation
      // camera.up.set(0, 0, 1);

      // // Get the current quaternion
      // const quaternion = camera.quaternion.clone();

      // // Decompose the quaternion to get the rotation angles
      // const euler = new THREE.Euler().setFromQuaternion(quaternion);

      // // Restrict the z-axis rotation
      // euler.z = 0;

      // // Recompose the quaternion
      // camera.quaternion.setFromEuler(euler);

      // arcballRef.current._tbRadius = EARTH_MEAN_RADIUS;

      // // Update the camera's matrix and the controls
      // camera.updateMatrixWorld();
      // arcballRef.current.update();
      arcballRef.current._tbRadius = EARTH_MEAN_RADIUS;
    }
  });

  return (
    <>
      {selections.focused.id === null ? (
        // <OrbitControls
        //   ref={orbitRef}
        //   enablePan={false}
        //   minDistance={EARTH_MEAN_RADIUS * 1.2}
        //   maxDistance={EARTH_MEAN_RADIUS * 50}
        //   target={[0, 0, 0]}
        // />
        <>
          {true ? (
            <OrbitControls
              ref={orbitRef}
              enablePan={false}
              minDistance={EARTH_MEAN_RADIUS * 1.2}
              maxDistance={EARTH_MEAN_RADIUS * 50}
              target={[0, 0, 0]}
            />
          ) : (
            <ArcballControls
              ref={arcballRef}
              enablePan={false}
              minDistance={EARTH_MEAN_RADIUS * 1.2}
              maxDistance={EARTH_MEAN_RADIUS * 50}
              target={[0, 0, 0]}
            />
          )}
        </>
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
