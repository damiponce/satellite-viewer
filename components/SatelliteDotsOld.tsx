import React from 'react';
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
  data: SatRec[];
  timer: any;
}) {
  const [, forceUpdate] = React.useReducer((x) => -x, 0);

  const NUM_WORKERS = navigator.hardwareConcurrency || 4;
  const CHUNK_SIZE = Math.ceil(data.length / NUM_WORKERS);
  const DATA_CHUNK: SatRec[][] = [];
  for (let i = 0; i < NUM_WORKERS; i++) {
    DATA_CHUNK.push(data.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
  }

  let instanceMatrix = new THREE.Matrix4();
  let camDist = 0;

  const settings = useSelector((state: RootState) => state.settings);
  const selections = useSelector((state: RootState) => state.selections);
  const dispatch = useDispatch();

  const instancedMeshRef = React.useRef<THREE.InstancedMesh>(null);
  const { camera } = useThree();
  // const data = data.map((sat) =>
  //   satellite.twoline2satrec(sat.tle1, sat.tle2),
  // );
  const workerPool = React.useRef<Worker[]>([]);
  let timeNow = new Date(timer.current.now());
  // const [satDataArr, setSatDataArr] = useState<SatelliteCalcType[][]>([]);

  const satDataArr = React.useRef<SatelliteCalcType[][]>([]);

  for (let i = 0; i < NUM_WORKERS; i++) {
    const dataChunk = data.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const chunk = dataChunk.map(
      (sat, i) =>
        satelliteCalc(
          timeNow,
          data[i],
          0,
          {
            focused: false,
            info: false,
          },
          dispatch,
        )!,
    );

    satDataArr.current[i] = chunk;
    // setSatDataArr((prev) => {
    //   prev[i] = chunk;
    //   return prev;
    // });
  }

  // console.log(data);

  // const satData = React.useRef<SatelliteCalcType>(
  //   satelliteCalc(
  //     timer,
  //     satRec,
  //     0,
  //     {
  //       focused: selections.focused.id === data.noradId,
  //       info: selections.info.id === data.noradId,
  //     },
  //     dispatch,
  //   )!, //!
  // );

  // useFrame(() => {
  //   forceUpdate();
  //   satData.current = satelliteCalc(
  //     timer,
  //     satRec,
  //     0,
  //     {
  //       focused: selections.focused.id === data.noradId,
  //       info: selections.info.id === data.noradId,
  //     },
  //     dispatch,
  //   )!;

  //   camera.updateMatrixWorld();
  //   // pointRef.current?.quaternion.copy(camera.quaternion);
  //   // const camDist =
  //   //   0.035 *
  //   //   camera.position
  //   //     .clone()
  //   //     .distanceTo(
  //   //       selections.focused.id === null
  //   //         ? new THREE.Vector3(0, 0, 0)
  //   //         : new THREE.Vector3(
  //   //             parseFloatAuto(selections.focused.posEc.x),
  //   //             parseFloatAuto(selections.focused.posEc.y),
  //   //             parseFloatAuto(selections.focused.posEc.z),
  //   //           ),
  //   //     );
  //   // pointRef.current?.scale.set(camDist, camDist, camDist);
  // });

  // useEffect(() => {
  //   console.log(satDataArr);
  // }, [satDataArr]);

  React.useEffect(() => {
    for (let i = 0; i < NUM_WORKERS; i++) {
      const worker = new Worker(
        new URL('./satelliteCalcWorker.ts', import.meta.url),
      );
      worker.onmessage = (e) => {
        satDataArr.current[i] = e.data;
        // forceUpdate();
        // setSatDataArr((prev) => {
        //   prev[1] = e.data;
        //   return prev;
        // });

        // setSatDataArr((prev) => [...prev, ...e.data]);
        // satDataArr.current.push(...e.data);
        workerPool.current[i].postMessage({
          timeNow,
          dataChunk: DATA_CHUNK[i],
        });
      };
      workerPool.current.push(worker);
    }

    return () => {
      workerPool.current.forEach((worker) => worker.terminate());
    };
  }, []);

  // React.useEffect(() => {
  useFrame(() => {
    // console.log('satDataArr');
    if (!instancedMeshRef.current) return;
    timeNow = new Date(timer.current.now());
    // satData = data.map(
    //   (sat, i) =>
    //     satelliteCalc(
    //       timeNow,
    //       data[i],
    //       0,
    //       {
    //         focused: selections.focused.id === sat.noradId,
    //         info: selections.info.id === sat.noradId,
    //       },
    //       dispatch,
    //     )!,
    // );

    // for (let i = 0; i < NUM_WORKERS; i++) {
    //   workerPool.current[i].postMessage({
    //     timeNow,
    //     dataChunk: DATA_CHUNK[i],
    //   });
    // }

    camera.updateMatrixWorld();
    camDist = 0.035 * camera.position.clone().distanceTo(ORIGIN_VEC);

    for (let j = 0; j < NUM_WORKERS; j++) {
      for (let i = 0; i < satDataArr.current[j].length; i++) {
        if (!satDataArr.current[j][i]) continue;
        instanceMatrix.identity();
        instancedMeshRef.current.setMatrixAt(
          i,
          instanceMatrix
            .makeTranslation(
              satDataArr.current[j][i].positionEcef.x,
              satDataArr.current[j][i].positionEcef.y,
              satDataArr.current[j][i].positionEcef.z,
            )
            .lookAt(camera.position, ORIGIN_VEC, UP_VEC)
            .scale(new THREE.Vector3(camDist, camDist, camDist)),
        );
      }
    }

    forceUpdate();
    if (instancedMeshRef.current)
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    // }, [satDataArr.current[0]]);
  });

  return (
    <instancedMesh ref={instancedMeshRef} args={[, , data.length]}>
      <circleGeometry args={[0.015]} />
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
