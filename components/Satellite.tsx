import { SatelliteType } from '@/lib/satellites/satellite';
import Orbit from '@/three/Orbit';
import React, { Suspense, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';

import * as satellite from 'satellite.js';
import { EciVec3 } from 'satellite.js';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import moment from 'moment';
const SunCalc = require('suncalc');
import { getGroundTracksSync } from 'tle.js';
import Loading from './overlay/Loading';
import { setFocusedData, setInfoData } from '@/lib/selections/selectionsSlice';
import { Dispatch } from '@reduxjs/toolkit';
import { parseFloatAuto } from '@/lib/utils';

/*  ˅˅˅  LIST OF OBJECTS PER SAT  ˅˅˅  */
/**
 
 [ ] point
 [ ] label
 [ ] orbit (eci)
 [ ] orbit track
 [ ] ground track

 **/
/*  ˄˄˄  LIST OF OBJECTS PER SAT  ˄˄˄  */

export default function Satellite({
  data,
  timer,
}: {
  data: SatelliteType;
  timer: any;
}) {
  const settings = useSelector((state: RootState) => state.settings);
  const selections = useSelector((state: RootState) => state.selections);
  const dispatch = useDispatch();

  const pointRef = React.useRef<THREE.Mesh>(null);
  const labelRef = React.useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const satRec = satellite.twoline2satrec(data.tle1, data.tle2);

  const satData = React.useRef<SatelliteCalcType>(
    satelliteCalc(
      timer,
      satRec,
      0,
      {
        focused: selections.focused.id === data.noradId,
        info: selections.info.id === data.noradId,
      },
      dispatch,
    )!, //!
  );

  useFrame(() => {
    satData.current = satelliteCalc(
      timer,
      satRec,
      0,
      {
        focused: selections.focused.id === data.noradId,
        info: selections.info.id === data.noradId,
      },
      dispatch,
    )!;

    camera.updateMatrixWorld();
    pointRef.current?.quaternion.copy(camera.quaternion);
    const camDist =
      0.035 *
      camera.position
        .clone()
        .distanceTo(
          selections.focused.id === null
            ? new THREE.Vector3(0, 0, 0)
            : new THREE.Vector3(
                parseFloatAuto(selections.focused.posEc.x),
                parseFloatAuto(selections.focused.posEc.y),
                parseFloatAuto(selections.focused.posEc.z),
              ),
        );
    pointRef.current?.scale.set(camDist, camDist, camDist);
    if (labelRef.current) {
      labelRef.current.visible = camDist > 4 ? false : true;
    }
    let temp = pointRef.current?.position.clone();

    if (!temp || !labelRef.current) return;
    camera.worldToLocal(temp);
    if (temp.x <= 0.02) {
      //@ts-ignore
      labelRef.current.anchorX = 'right';
      labelRef.current.position.set(-0.2, 0, 0);
    } else {
      //@ts-ignore
      labelRef.current.anchorX = 'left';
      labelRef.current.position.set(0.2, 0, 0);
    }
  });

  // React.useEffect(() => {
  //   console.log(satData.orbitEcefCurve);
  // }, [satData.orbitEcefCurve]);

  if (!data.visible) return null;

  return (
    // <Suspense fallback={null}>
    <group>
      <Orbit
        // @ts-ignore
        enabled={settings.elements.orbitEci}
        linewidth={0.9}
        curve={satData.current?.orbitEciCurve}
      />
      <Orbit
        //  @ts-ignore
        enabled={settings.elements.orbitEcef}
        linewidth={0.9}
        curve={satData.current?.orbitEcefCurve}
        color={0xff2200}
        // onPointerMove={(e) => {
        //   e.stopPropagation();
        //   if (!hoverRef.current) return;
        //   hoverRef.current.visible = true;
        //   hoverRef.current.position.copy(e.pointOnLine ?? e.point);
        // }}
        // onPointerLeave={(e) => {
        //   e.stopPropagation();
        //   if (!hoverRef.current) return;
        //   hoverRef.current.visible = false;
        // }}
      />
      <Orbit
        //  @ts-ignore
        enabled={false || settings.elements.groundTrack}
        linewidth={0.9}
        color={0x00ff00}
        curve={satData.current?.groundTrackCurve}
      />

      <mesh
        position={satData.current?.positionEcef || new THREE.Vector3()}
        ref={pointRef}
        renderOrder={100}
      >
        {/* @ts-ignore */}
        {!!settings.elements.point && <circleGeometry args={[0.075]} />}
        {/* @ts-ignore */}
        {!!settings.elements.label && (
          <Text
            color={data.color}
            ref={labelRef}
            fontSize={0.25}
            position={[0.2, 0, 0]}
            anchorX='left'
            anchorY='middle'
            font='http://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf'
            characters='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,-()'
          >
            {data.name}
          </Text>
        )}
        <meshPhysicalMaterial color={data.color} emissive={data.color} />
      </mesh>
    </group>
    // </Suspense>
  );
}

type SatelliteCalcType = {
  positionEci: THREE.Vector3;
  positionEcef: THREE.Vector3;
  positionGeo: THREE.Vector3;
  velocityEci: THREE.Vector3;

  orbitEcefCurve: number[];
  orbitEciCurve: number[];
  groundTrackCurve: number[];
  extraData: string;
};

function ECItoTHREE(eciVec3: EciVec3<number>, scale = 1) {
  return new THREE.Vector3(
    eciVec3.x * scale,
    eciVec3.y * scale,
    eciVec3.z * scale,
  );
}

function satelliteCalc(
  timer: any,
  satRec: satellite.SatRec,
  curveMinutes: number,
  { focused, info }: { focused: boolean; info: boolean },
  dispatch: Dispatch,
): SatelliteCalcType | null {
  const SCALE = 1 / 1000;
  var data: SatelliteCalcType = {
    positionEci: new THREE.Vector3(),
    positionEcef: new THREE.Vector3(),
    positionGeo: new THREE.Vector3(),
    velocityEci: new THREE.Vector3(),
    orbitEcefCurve: [],
    orbitEciCurve: [],
    groundTrackCurve: [],
    extraData: '',
  };

  const timeNow = new Date(timer.current.now());

  const posVel = satellite.propagate(satRec, timeNow);

  if (
    typeof posVel.position === 'boolean' ||
    typeof posVel.velocity === 'boolean'
  )
    return null; // TODO: Handle errors correctly

  const gmst = satellite.gstime(timeNow);
  const positionEcef = satellite.eciToEcf(posVel.position, gmst);
  const positionGd = satellite.eciToGeodetic(posVel.position, gmst);

  data.positionEci = ECItoTHREE(posVel.position, SCALE);
  data.positionEcef = ECItoTHREE(positionEcef, SCALE);
  // TODO: Add geodetic to THREE conversion
  data.velocityEci = ECItoTHREE(posVel.velocity, SCALE);

  if (focused) {
    setTimeout(() => {
      dispatch(
        setFocusedData({
          path: 'posEc.x',
          value: data.positionEcef.x.toString(),
        }),
      );
      dispatch(
        setFocusedData({
          path: 'posEc.y',
          value: data.positionEcef.y.toString(),
        }),
      );
      dispatch(
        setFocusedData({
          path: 'posEc.z',
          value: data.positionEcef.z.toString(),
        }),
      );
    }, 10);
  }
  if (info) {
    setTimeout(() => {
      dispatch(
        setInfoData({
          path: 'posGeo.lat',
          value: radToDeg(positionGd.latitude),
        }),
      );
      dispatch(
        setInfoData({
          path: 'posGeo.lon',
          value: radToDeg(positionGd.longitude),
        }),
      );
      dispatch(
        setInfoData({ path: 'posGeo.height', value: positionGd.height }),
      );
    }, 10);
  }

  // ============ // Orbits // ============ //
  const SEGMENT_MULTIPLIER = 1;
  const revPerDay = (satRec.no * 1440) / (2 * Math.PI);
  let segments = Math.round((24 * 60) / revPerDay) * SEGMENT_MULTIPLIER; //! more than 1 is very laggy

  let orbitEcefCurve: number[] = [];
  let orbitEciCurve: number[] = [];
  let groundTrackCurve: number[] = [];

  for (let i = 0; i < segments; i++) {
    const iterDate = new Date(timer.current.now());
    // .add(i * 60, 'seconds')
    // .toDate(); // !!!!!!!
    iterDate.setMinutes(iterDate.getMinutes() + i / SEGMENT_MULTIPLIER);
    const iterPosVel = satellite.propagate(satRec, iterDate);
    const iterGmst = satellite.gstime(iterDate);
    if (typeof iterPosVel.position === 'boolean') return null;

    // TODO: Shift ECI orbit to match middle with satellite position
    const iterPositionEci = satellite.eciToEcf(iterPosVel.position, gmst);
    orbitEciCurve.push(iterPositionEci.x * SCALE);
    orbitEciCurve.push(iterPositionEci.y * SCALE);
    orbitEciCurve.push(iterPositionEci.z * SCALE);
    let dupes = orbitEciCurve.slice(-3);
    orbitEciCurve.push(...dupes);

    const iterPositionEcef = satellite.eciToEcf(iterPosVel.position, iterGmst);
    orbitEcefCurve.push(iterPositionEcef.x * SCALE);
    orbitEcefCurve.push(iterPositionEcef.y * SCALE);
    orbitEcefCurve.push(iterPositionEcef.z * SCALE);
    dupes = orbitEcefCurve.slice(-3);
    orbitEcefCurve.push(...dupes);
  }

  /*
  const iterGroundPositionsGD = getGroundTracksSync({
    tle: [tle1, tle2],
    startTimeMS: timer.current.now(),
    stepMS: 60 * 1000,
    isLngLatFormat: true,
  });
  for (let lngLatPos of iterGroundPositionsGD[1]) {
    const iterGroundPosition = satellite.ecfToEci(
      satellite.geodeticToEcf({
        longitude: degToRad(lngLatPos[0]),
        latitude: degToRad(lngLatPos[1]),
        height: 0,
      }),
      gmst,
    );
    groundTrackCurve.push(iterGroundPosition.x * SCALE);
    groundTrackCurve.push(iterGroundPosition.y * SCALE);
    groundTrackCurve.push(iterGroundPosition.z * SCALE);

    let dupes = groundTrackCurve.slice(-3);
    groundTrackCurve.push(...dupes);
  }
  */

  data.orbitEcefCurve = orbitEcefCurve;
  data.orbitEciCurve = orbitEciCurve;

  // data.groundTrackCurve = groundTrackCurve;

  return data;
}

const degToRad = (deg: number) => (deg * Math.PI) / 180;
const radToDeg = (rad: number) => (rad * 180) / Math.PI;
