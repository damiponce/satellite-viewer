import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as THREE from 'three';
import moment from 'moment';
import * as satellite from 'satellite.js';
import { Dispatch } from '@reduxjs/toolkit';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const loadTexture = async (url: any): Promise<THREE.Texture> => {
  var loader = new THREE.TextureLoader();
  return new Promise((resolve) => {
    loader.load(url, (texture) => {
      resolve(texture);
    });
  });
};

export const loadTextureSync = (url: any): THREE.Texture => {
  var loader = new THREE.TextureLoader();
  return loader.load(url);
};

export function parseFloatAuto(value: number | string) {
  if (typeof value === 'string') {
    return parseFloat(value);
  } else {
    return value;
  }
}

export function isCookieExpired(str?: string) {
  if (!str) return true;
  const match = str.match(/expires=([^;]+)/);
  if (!match) return true;
  const expiryDate = new Date(match[1]);
  return expiryDate <= new Date();
}

export function ECItoTHREE(eciVec3: satellite.EciVec3<number>, scale = 1) {
  return new THREE.Vector3(
    eciVec3.x * scale,
    eciVec3.y * scale,
    eciVec3.z * scale,
  );
}

export const degToRad = (deg: number) => (deg * Math.PI) / 180;
export const radToDeg = (rad: number) => (rad * 180) / Math.PI;

export type SatelliteCalcType = {
  positionEcef: THREE.Vector3;
};

export function satelliteCalc(
  timeNow: any,
  satRec: satellite.SatRec,
  curveMinutes: number,
  { focused, info }: { focused: boolean; info: boolean },
  dispatch?: Dispatch,
): SatelliteCalcType | null {
  try {
    const SCALE = 1 / 1000;
    var data: SatelliteCalcType = {
      positionEcef: new THREE.Vector3(),
    };

    const posVel = satellite.propagate(satRec, timeNow);

    if (
      typeof posVel.position === 'boolean' ||
      typeof posVel.velocity === 'boolean'
    )
      return null; // TODO: Handle errors correctly

    const gmst = satellite.gstime(timeNow);
    const positionEcef = satellite.eciToEcf(posVel.position, gmst);
    // const positionGd = satellite.eciToGeodetic(posVel.position, gmst);

    data.positionEcef = ECItoTHREE(positionEcef, SCALE);

    // if (focused && dispatch) {
    //   setTimeout(() => {
    //     dispatch(
    //       setFocusedData({
    //         path: 'posEc.x',
    //         value: data.positionEcef.x.toString(),
    //       }),
    //     );
    //     dispatch(
    //       setFocusedData({
    //         path: 'posEc.y',
    //         value: data.positionEcef.y.toString(),
    //       }),
    //     );
    //     dispatch(
    //       setFocusedData({
    //         path: 'posEc.z',
    //         value: data.positionEcef.z.toString(),
    //       }),
    //     );
    //   }, 10);
    // }
    // if (info && dispatch) {
    //   setTimeout(() => {
    //     dispatch(
    //       setInfoData({
    //         path: 'posGeo.lat',
    //         value: radToDeg(positionGd.latitude),
    //       }),
    //     );
    //     dispatch(
    //       setInfoData({
    //         path: 'posGeo.lon',
    //         value: radToDeg(positionGd.longitude),
    //       }),
    //     );
    //     dispatch(
    //       setInfoData({ path: 'posGeo.height', value: positionGd.height }),
    //     );
    //   }, 10);
    // }

    return data;
  } catch (error) {
    // console.error('satRec: ', satRec);
    // console.error('propagate: ', satellite.propagate(satRec, timeNow));
    // console.error(error);
    // debugger;
    return null;
  }
}
