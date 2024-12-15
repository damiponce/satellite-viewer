import React, { useReducer, useRef, useEffect, useLayoutEffect } from 'react';
import * as THREE from 'three';

import * as satellite from 'satellite.js';
import { EciVec3, SatRec } from 'satellite.js';
import { useFrame, useThree } from '@react-three/fiber';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { setFocusedData } from '@/lib/selections/selectionsSlice';
import { Dispatch } from '@reduxjs/toolkit';
import { satelliteCalc, SatelliteCalcType } from '@/lib/utils';
const ORIGIN_VEC = new THREE.Vector3(0, 0, 0);
const UP_VEC = new THREE.Vector3(0, 1, 0);

export default function Satellite({
  data,
  timer,
}: {
  data: React.MutableRefObject<SatRec[]>;
  timer: any;
}) {
  const [, forceUpdate] = useReducer((x) => -x, 0);

  let instanceMatrix = new THREE.Matrix4();
  let camDist = 0;

  const settings = useSelector((state: RootState) => state.settings);
  const selections = useSelector((state: RootState) => state.selections);
  const dispatch = useDispatch();

  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const { camera } = useThree();

  const workerPool = useRef<Worker[]>([]);
  let timeNow = new Date(timer.current.now());

  const satDataArr = useRef<SatelliteCalcType[]>([]);

  const chunk = data.current.map(
    (sat, i) =>
      satelliteCalc(
        timeNow,
        sat,
        0,
        {
          focused: false,
          info: false,
        },
        dispatch,
      )!,
  );

  satDataArr.current = chunk;

  useLayoutEffect(() => {
    const worker = new Worker(
      new URL('./satelliteCalcWorker.ts', import.meta.url),
    );

    worker.onmessage = (e) => {
      updatePositions(e.data);
      // console.log('WORKER', e.data);
      // console.log('DATA', data.current);
      // debugger;

      workerPool.current[0].postMessage({
        timeNow: new Date(timer.current.now()),
        dataChunk: data.current,
      });
    };
    workerPool.current.push(worker);

    workerPool.current[0].postMessage({
      timeNow: new Date(timer.current.now()),
      dataChunk: data.current,
    });

    return () => {
      workerPool.current.forEach((worker) => worker.terminate());
    };
  }, []);

  function updatePositions(arr: SatelliteCalcType[]) {
    if (!instancedMeshRef.current) return;

    for (let i = 0; i < arr.length; i++) {
      if (!arr[i]) continue;
      instanceMatrix.identity();
      instancedMeshRef.current.setMatrixAt(
        i,
        instanceMatrix.makeTranslation(
          arr[i].positionEcef.x,
          arr[i].positionEcef.y,
          arr[i].positionEcef.z,
        ),
      );
    }
    forceUpdate();
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }

  useFrame(() => {
    if (!instancedMeshRef.current) return;

    camera.updateMatrixWorld();
    camDist = 0.035 * camera.position.clone().distanceTo(ORIGIN_VEC);

    for (let i = 0; i < data.current.length; i++) {
      if (!data.current[i]) continue;
      instancedMeshRef.current.getMatrixAt(i, instanceMatrix);
      instancedMeshRef.current.setMatrixAt(
        i,
        instanceMatrix
          .lookAt(camera.position, ORIGIN_VEC, UP_VEC)
          .scale(new THREE.Vector3(camDist, camDist, camDist)),
      );
    }
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={instancedMeshRef} args={[, , data.current.length]}>
      <circleGeometry args={[0.015, 4]} />
      <meshPhysicalMaterial
        color={0xffffff}
        side={THREE.DoubleSide}
        opacity={0.5}
        emissive={0xffffff}
        emissiveIntensity={1}
      />
    </instancedMesh>
  );
}
