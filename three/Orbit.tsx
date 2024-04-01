import React from 'react';
import {
  ReactThreeFiber,
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
  color = 0xffffff,
  ...rest
}: {
  enabled: boolean;
  linewidth: number;
  curve: Float32Array | number[];
  color?: number;
} & MeshProps) {
  if (enabled === false || curve === null) return null;
  const geomRef = React.useRef<LineSegmentsGeometry>(null);
  const matRef = React.useRef<LineMaterial>(null);

  const rgb = {
    r: ((color & 0xff0000) >>> 16) / 255,
    g: ((color & 0x00ff00) >>> 8) / 255,
    b: (color & 0x0000ff) / 255,
  };
  // console.log(color, rgb);

  useFrame(() => {
    if (Array.isArray(curve)) {
      curve.push(...curve.splice(0, 3));
      curve.splice(-3, 3);
      curve.push(
        ...[
          curve[curve.length - 3],
          curve[curve.length - 2],
          curve[curve.length - 1],
        ],
      );
      // console.log(curve);
      // debugger;
      curve = new Float32Array(curve);
    }
    const positions = curve;
    // const positions = new Float32Array(points);

    const colors = new Float32Array((positions.length / 3) * 4);
    for (let i = 0; i <= positions.length / 3; i++) {
      let c = 1 - (3 * i) / (positions.length * 1.0);
      colors[i * 4] = rgb.r;
      colors[i * 4 + 1] = rgb.g;
      colors[i * 4 + 2] = rgb.b;
      colors[i * 4 + 3] = 0.7;
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
        ref={matRef}
        linewidth={0.0025 * linewidth}
        vertexColors={true}
        worldUnits={false}
        transparent={true}
        alphaToCoverage={true}
        blending={THREE.CustomBlending}
        blendEquation={THREE.AddEquation}
        blendSrc={THREE.SrcAlphaFactor}
        blendSrcAlpha={THREE.OneFactor}
        blendDst={THREE.ZeroFactor}
        depthFunc={THREE.LessEqualDepth}
        depthWrite={true}
      />
    </lineSegments2>
  );
}

export default Orbit;
