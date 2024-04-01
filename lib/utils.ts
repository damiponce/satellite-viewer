import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as THREE from 'three';

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
