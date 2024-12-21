import React, { useReducer, useRef, useEffect } from 'react';
import * as THREE from 'three';

import { PointMaterial } from '@react-three/drei';

import { useLoading } from './LoadingScreen';
import { useFrame } from '@react-three/fiber';

export default function Satellite({
  data,
  timer,
}: {
  data: string[];
  timer: any;
}) {
  const [, forceUpdate] = useReducer((x) => -x, 0);
  const pointMaterialRef = useRef<THREE.PointsMaterial>(null);

  const { completeLoadingTask } = useLoading();

  const workerPool = useRef<Worker[]>([]);

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

  const pointsRef = useRef<THREE.Points>(null);

  function updatePositions(arr: Float32Array) {
    if (!pointsRef.current) return;

    pointsRef.current.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(arr, 3),
    );
    pointsRef.current.geometry.getAttribute('position').needsUpdate = true;
    pointsRef.current.geometry.computeBoundingSphere();

    pointsRef.current.geometry.setAttribute(
      'color',
      // new THREE.BufferAttribute(arr, 3),
      new THREE.BufferAttribute(new Float32Array(arr.length).fill(1), 3),
    );
    pointsRef.current.geometry.getAttribute('color').needsUpdate = true;

    pointsRef.current.matrixWorldNeedsUpdate = true;
  }

  useFrame(({ camera }) => {
    if (!pointMaterialRef.current) return;
    const distance = camera.position.length();
    // if (distance < 100) {
    //   pointMaterialRef.current.size = 2;
    // } else if (distance < 200) {
    //   pointMaterialRef.current.size = 1.5;
    // } else {
    //   pointMaterialRef.current.size = 1;
    // }
    const minSize = 1; // Size when distance >= 200
    const maxSize = 2; // Size when distance <= 100
    const minDistance = 100; // Start of interpolation range
    const maxDistance = 200; // End of interpolation range

    const size =
      maxSize -
      ((distance - minDistance) / (maxDistance - minDistance)) *
        (maxSize - minSize);

    // Clamp the size between minSize and maxSize to ensure smooth interpolation
    pointMaterialRef.current.size = Math.max(minSize, Math.min(maxSize, size));
  });

  return (
    <points ref={pointsRef}>
      <PointMaterial
        ref={pointMaterialRef}
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
          array={new Float32Array(1)}
          itemSize={3}
        />
      </bufferGeometry>
    </points>
  );
}
