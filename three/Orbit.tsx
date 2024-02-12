import React from 'react';
import {
  ReactThreeFiber,
  PrimitiveProps,
  extend,
  MeshProps,
  useFrame,
} from '@react-three/fiber';
import {
  LineSegments2,
  LineMaterial,
  LineSegmentsGeometry,
} from 'three-stdlib';
import * as THREE from 'three';
import { raycast } from 'meshline';

const SEGMENTS = 500;

extend({ LineSegments2, LineMaterial, LineSegmentsGeometry });
declare global {
  namespace JSX {
    interface IntrinsicElements {
      lineSegments2: ReactThreeFiber.Object3DNode<
        LineSegments2,
        typeof LineSegments2
      >;
      lineMaterial: ReactThreeFiber.MaterialNode<
        LineMaterial,
        typeof LineMaterial
      >;
      lineSegmentsGeometry: ReactThreeFiber.BufferGeometryNode<
        LineSegmentsGeometry,
        typeof LineSegmentsGeometry
      >;
    }
  }
}

function Orbit({
  enabled,
  linewidth,
  curve,
  color,
  ...rest
}: {
  enabled: boolean;
  linewidth: number;
  curve: Float32Array | number[];
  color?: string | number;
} & MeshProps) {
  if (enabled === false) return null;
  const geomRef = React.useRef<LineSegmentsGeometry>(null);
  const matRef = React.useRef<LineMaterial>(null);

  useFrame(() => {
    const _curve = new THREE.EllipseCurve(
      5,
      0,
      18,
      15,
      0,
      2 * Math.PI,
      false,
      0,
    );
    var points = _curve
      .getPoints(SEGMENTS)
      .reduce<number[]>((acc, { x, y }) => [...acc, x, y, 0, x, y, 0], []);
    points.push(...points.splice(0, 3));

    if (Array.isArray(curve)) {
      curve.push(...curve.splice(0, 3));
      curve.splice(-1, 1);
      curve = new Float32Array(curve);
    }
    const positions = curve;
    // const positions = new Float32Array(points);

    const colors = new Float32Array((positions.length / 3) * 4);
    for (let i = 0; i <= positions.length / 3; i++) {
      let c = 1 - (3 * i) / (positions.length * 1.0);
      colors[i * 4] = 1;
      colors[i * 4 + 1] = 1;
      colors[i * 4 + 2] = 1;
      colors[i * 4 + 3] = 1;
    }

    geomRef.current?.setPositions(positions);
    geomRef.current?.setColors(colors, 4);
    geomRef.current?.computeBoundingSphere();
  });

  return (
    //  @ts-ignore

    <lineSegments2 {...rest}>
      <lineSegmentsGeometry attach='geometry' ref={geomRef} />
      <lineMaterial
        attach='material'
        color={color}
        ref={matRef}
        linewidth={linewidth}
        worldUnits={true}
        transparent={true}
        alphaToCoverage={true}
        blendAlpha={THREE.AdditiveBlending}
        vertexColors={false}
      />
    </lineSegments2>
  );
}

export default Orbit;
