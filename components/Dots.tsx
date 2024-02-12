import { EARTH_MEAN_RADIUS } from '@/utils/constants';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function checkVisibility(map: boolean[][], long: number, lat: number) {
  // if (!map) return false;
  let x = Math.min(
    Math.round(((long + 180) / 360) * map[0].length),
    map[0].length - 1,
  );
  let y = Math.min(Math.round(((lat + 90) / 180) * map.length), map.length - 1);
  y = map.length - y - 1;
  return map[y][x];
}

export default function Dots({
  rows = 180,
  dotDensity = 6,
  map,
  temp = new THREE.Object3D(),
}: {
  rows: number;
  dotDensity: number;
  map: boolean[][];
  temp?: THREE.Object3D;
}) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  const DEG2RAD = Math.PI / 180;

  let n = 0;

  for (let lat = -90; lat <= 90; lat += 180 / rows) {
    const radius = Math.cos(Math.abs(lat) * DEG2RAD) * EARTH_MEAN_RADIUS;
    const circumference = radius * Math.PI * 2;
    const dotsForLat = circumference * dotDensity;
    for (let x = 0; x < dotsForLat; x++) {
      n++;
    }
  }

  useEffect(() => {
    let i = 0;
    for (let lat = -90; lat <= 90; lat += 180 / rows) {
      const radius = Math.cos(Math.abs(lat) * DEG2RAD) * EARTH_MEAN_RADIUS;
      const circumference = radius * Math.PI * 2;
      const dotsForLat = circumference * dotDensity;
      for (let x = 0; x < dotsForLat; x++) {
        const long = -180 + (x * 360) / dotsForLat;
        if (!checkVisibility(map, long, lat)) continue;
        let cartesianCoords = new THREE.Vector3();
        cartesianCoords.setFromSphericalCoords(
          EARTH_MEAN_RADIUS,
          (90 - lat) * DEG2RAD,
          (180 + long) * DEG2RAD - Math.PI / 2,
        );
        temp.position.set(
          cartesianCoords.x,
          cartesianCoords.y,
          cartesianCoords.z,
        );
        temp.lookAt(0, 0, 0);
        temp.updateMatrix();
        instancedMeshRef.current?.setMatrixAt(i, temp.matrix);
        i++;
      }
    }
    if (instancedMeshRef.current)
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={instancedMeshRef} args={[, , n]}>
      <circleGeometry args={[0.03]} />
      <meshPhysicalMaterial
        color={0xffffff}
        side={THREE.BackSide}
        opacity={0.5}
        emissive={0xffffff}
        emissiveIntensity={1}
      />
    </instancedMesh>
  );
}
