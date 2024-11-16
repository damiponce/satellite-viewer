import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as THREE from 'three';
import moment from 'moment';

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
