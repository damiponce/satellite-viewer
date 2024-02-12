import { SatelliteType } from '@/lib/satellites/satellite';
import Orbit from '@/three/Orbit';
import React, { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';

import * as satellite from 'satellite.js';
import { EciVec3 } from 'satellite.js';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import moment from 'moment';
const SunCalc = require('suncalc');
import { getGroundTracksSync } from 'tle.js';

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

  const pointRef = React.useRef<THREE.Mesh>(null);
  const labelRef = React.useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const [satData, setSatData] = React.useState<SatelliteCalcType>(
    satelliteCalc(timer, data.tle1, data.tle2, 0)!,
  );

  // React.useEffect(() => {
  //   console.log(satData);
  // }, [satData]);

  useFrame(() => {
    // console.warn('SAT', data.name);

    setSatData(satelliteCalc(timer, data.tle1, data.tle2, 0)!);

    camera.updateMatrixWorld();
    pointRef.current?.quaternion.copy(camera.quaternion);
    const camDist =
      0.035 * camera.position.clone().distanceTo(new THREE.Vector3(0, 0, 0));
    pointRef.current?.scale.set(camDist, camDist, camDist);
    if (labelRef.current) {
      labelRef.current.visible = camDist > 4 ? false : true;
    }
    let temp = pointRef.current?.position.clone();

    if (!temp || !labelRef.current) return;
    camera.worldToLocal(temp);
    if (temp.x < 0) {
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
    <group>
      <Orbit
        // @ts-ignore
        enabled={settings.elements.orbitEci}
        linewidth={0.06}
        curve={satData.orbitEciCurve}
      />
      <Orbit
        //  @ts-ignore
        enabled={settings.elements.orbitEcef}
        linewidth={0.06}
        curve={satData.orbitEcefCurve}
        color={0xdd6600}
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
        linewidth={0.06}
        color={0x00ff00}
        curve={satData.groundTrackCurve}
      />

      <mesh position={satData.positionEcef} ref={pointRef}>
        {/* @ts-ignore */}
        {!!settings.elements.point && <circleGeometry args={[0.1]} />}
        {/* @ts-ignore */}
        {!!settings.elements.label && (
          <Text
            ref={labelRef}
            fontSize={0.25}
            position={[0.2, 0, 0]}
            anchorX='left'
            anchorY='middle'
            font='http://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf'
          >
            {data.name}
          </Text>
        )}
        <meshBasicMaterial color={data.color} />
      </mesh>
    </group>
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
  tle1: string,
  tle2: string,
  curveMinutes: number,
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

  const satRec = satellite.twoline2satrec(tle1, tle2);
  var posVel = satellite.propagate(satRec, new Date(timer.now()));

  if (
    typeof posVel.position === 'boolean' ||
    typeof posVel.velocity === 'boolean'
  )
    return null; // TODO: Handle errors correctly

  var gmst = satellite.gstime(new Date(timer.now()));
  var positionEcef = satellite.eciToEcf(posVel.position, gmst);
  var positionGd = satellite.eciToGeodetic(posVel.position, gmst);

  data.positionEci = ECItoTHREE(posVel.position, SCALE);
  data.positionEcef = ECItoTHREE(positionEcef, SCALE);
  // TODO: Add geodetic to THREE conversion
  data.velocityEci = ECItoTHREE(posVel.velocity, SCALE);

  // ============ // Orbit track // ============ //
  const revPerDay = (satRec.no * 1440) / (2 * Math.PI);
  let segments = Math.round((24 * 60) / revPerDay) * 1;

  let orbitEcefCurve: number[] = [];
  let orbitEciCurve: number[] = [];
  let groundTrackCurve: number[] = [];

  for (let i = 0; i < segments; i++) {
    const iterDate = moment(timer.now())
      .add(i * 60, 'seconds')
      .toDate(); // !!!!!!!
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
    startTimeMS: timer.now(),
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
