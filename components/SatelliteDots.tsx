import React, {
  useReducer,
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useMemo,
} from 'react';
import * as THREE from 'three';

import * as satellite from 'satellite.js';
import { EciVec3, SatRec } from 'satellite.js';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { setFocusedData } from '@/lib/selections/selectionsSlice';
import { Dispatch } from '@reduxjs/toolkit';
import { satelliteCalc, SatelliteCalcType } from '@/lib/utils';

import initWasm, { Satellites } from '@/lib/pkg/satellite_viewer_wasm';
import { loadWasm } from '@/lib/test_wasm';
import {
  Billboard,
  Point,
  PointMaterial,
  Points,
  shaderMaterial,
} from '@react-three/drei';

import { cloneDeep } from 'lodash';
import { diff } from 'deep-object-diff';
import { useLoading } from './LoadingScreen';

const ORIGIN_VEC = new THREE.Vector3(0, 0, 0);
const UP_VEC = new THREE.Vector3(0, 1, 0);

export default function Satellite({
  data,
  timer,
}: {
  data: string[];
  timer: any;
}) {
  const [, forceUpdate] = useReducer((x) => -x, 0);

  const { completeLoadingTask } = useLoading();

  const instanceMatrix = useMemo(() => new THREE.Matrix4(), []);
  let camDist = 0;

  const settings = useSelector((state: RootState) => state.settings);
  const selections = useSelector((state: RootState) => state.selections);
  const dispatch = useDispatch();

  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const { camera } = useThree();

  const workerPool = useRef<Worker[]>([]);
  let timeNow = new Date(timer.current.now());

  const satDataArr = useRef<SatelliteCalcType[]>([]);

  const satClass = useRef<Satellites | null>(null);

  // const chunk = data.current.map(
  //   (sat, i) =>
  //     satelliteCalc(
  //       timeNow,
  //       sat,
  //       0,
  //       {
  //         focused: false,
  //         info: false,
  //       },
  //       dispatch,
  //     )!,
  // );

  // satDataArr.current = chunk;
  // useEffect(() => {
  //   if (data.current.length === 0) return;

  //   initWasm();
  //   if (!satClass.current) return;

  //   satClass.current.update(data.current);

  //   console.log(
  //     'useEffect UPDATE AND PROP',
  //     satClass.current.propagate(BigInt(timeNow.getTime())),
  //   );
  // }, [data.current]);

  async function loadWasm() {
    if (!satClass.current) {
      await initWasm().then(() => {
        console.log('PRE-INITWASM DATA', data);
        satClass.current = new Satellites(data);
      });
    } else {
      satClass.current.update(data);
      console.log(
        'useEffect UPDATE AND PROP',
        satClass.current.propagate(BigInt(timeNow.getTime())),
      );
      const worker = new Worker(
        new URL('./satelliteCalcWorker.ts', import.meta.url),
      );

      worker.onmessage = (e) => {
        updatePositions(e.data);

        workerPool.current[0].postMessage({
          timeNow: timer.current.now(),
          satClass: satClass.current,
        });
      };
      workerPool.current.push(worker);

      workerPool.current[0].postMessage({
        timeNow: timer.current.now(),
        satClass: satClass,
      });

      return () => {
        workerPool.current.forEach((worker) => worker.terminate());
      };
    }
  }

  useEffect(() => {
    if (data.length === 0) return;

    completeLoadingTask('satellite-data');
    const worker = new Worker(
      new URL('./satelliteCalcWorker.ts', import.meta.url),
    );

    // console.log('About to init worker with data:', data);

    worker.postMessage({ type: 'init', payload: { tles: data } });

    // Listen for messages from the worker
    worker.onmessage = (e) => {
      const { type, results, error } = e.data;

      if (type === 'ready') {
        console.log('Satellite worker is ready');
        worker.postMessage({
          type: 'propagate',
          payload: { time: timer.current.now() },
        });
      }

      if (type === 'propagateResult') {
        // console.log('Satellite positions:', results);
        updatePositions(results);
        // updatePositions(
        //   new Float32Array([
        //     10, 10, 10, -10, -10, -10, 10, -10, -10, -10, 10, -10,
        //   ]),
        // );
        worker.postMessage({
          type: 'propagate',
          payload: { time: timer.current.now() },
        });
      }

      if (type === 'error') {
        console.error('Error from worker:', error);
      }
    };

    workerPool.current.push(worker);

    return () => {
      workerPool.current.forEach((worker) => worker.terminate());
    };
  }, [data]);

  // function updatePositions(arr: Float32Array) {
  //   if (!instancedMeshRef.current) return;

  //   for (let i = 0; i < arr.length; i += 3) {
  //     if (!arr[i + 2]) continue;
  //     instanceMatrix.identity();
  //     instancedMeshRef.current.setMatrixAt(
  //       i,
  //       instanceMatrix.makeTranslation(
  //         arr[i] / 1000,
  //         arr[i + 1] / 1000,
  //         arr[i + 2] / 1000,
  //       ),
  //     );
  //   }
  //   forceUpdate();
  //   instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  // }

  const pointsRef = useRef<THREE.Points>(null);

  function updatePositions(arr: Float32Array) {
    if (!pointsRef.current) return;

    // console.log(pointsRef.current);
    // debugger;

    pointsRef.current.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(arr, 3),
    );
    pointsRef.current.geometry.getAttribute('position').needsUpdate = true;
    pointsRef.current.geometry.computeBoundingSphere();

    pointsRef.current.geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(arr.length).fill(1), 3),
    );
    pointsRef.current.geometry.getAttribute('color').needsUpdate = true;

    pointsRef.current.matrixWorldNeedsUpdate = true;

    // console.log('UPDATE POSITIONS ' + arr.length);
    // console.log(pointsRef.current);
    // debugger;
  }

  // useFrame(() => {
  //   if (!instancedMeshRef.current) return;

  //   camera.updateMatrixWorld();
  //   camDist = 0.035 * camera.position.clone().distanceTo(ORIGIN_VEC);

  //   for (let i = 0; i < data.current.length; i++) {
  //     if (!data.current[i]) continue;
  //     instancedMeshRef.current.getMatrixAt(i, instanceMatrix);
  //     instancedMeshRef.current.setMatrixAt(
  //       i,
  //       instanceMatrix
  //         .lookAt(camera.position, ORIGIN_VEC, UP_VEC)
  //         .scale(new THREE.Vector3(camDist, camDist, camDist)),
  //     );
  //   }
  //   instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  // });

  // return (
  //   <instancedMesh ref={instancedMeshRef} args={[, , 4]}>
  //     {/* <planeGeometry args={[1, 1]} /> */}
  //     {/* <circleGeometry args={[0.015, 4]} /> */}
  //     {/* <sphereGeometry args={[0.15, 16, 16]} /> */}
  //     <bufferGeometry />
  //     <PointMaterial
  //       transparent
  //       vertexColors
  //       size={4}
  //       sizeAttenuation={false}
  //       depthTest={true}
  //       toneMapped={false}
  //     />
  //     {/* <meshPhysicalMaterial
  //       color={0xffffff}
  //       side={THREE.DoubleSide}
  //       opacity={0.5}
  //       emissive={0xffffff}
  //       emissiveIntensity={1}
  //     /> */}
  //   </instancedMesh>
  // );

  return (
    <points ref={pointsRef}>
      <PointMaterial
        attach='material'
        transparent
        vertexColors
        size={2}
        sizeAttenuation={false}
        depthTest={true}
        toneMapped={false}
      />
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          count={0}
          array={new Float32Array(0)}
          itemSize={3}
        />
        <bufferAttribute
          attach='attributes-color'
          count={0}
          array={new Float32Array(0)}
          itemSize={3}
        />
      </bufferGeometry>
    </points>
  );
}

const tempPoints = Array.from({ length: 2000 }, (i) => 0);
