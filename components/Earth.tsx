import { EARTH_MEAN_RADIUS } from '@/utils/constants';

import React, { Suspense, useEffect, useLayoutEffect, useState } from 'react';
import * as THREE from 'three';
import { extend, useLoader } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

import CustomShaderMaterial from 'three-custom-shader-material';
import Dots from './Dots';
import { analyzeImage, loadImage } from '@/utils/map-dots';

const vs = `
  varying vec2 vUv;
  varying vec3 csm_Normal;
  
  void main() {
    vUv = uv;
    csm_Normal = normalMatrix * normal;
  }
  `;

const fs = `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  
  uniform vec3 sunDirection;
  
  varying vec2 vUv;
  varying vec3 csm_Normal;
  
  void main( void ) {
    vec3 dayColor = texture2D( dayTexture, vUv ).rgb;
    vec3 nightColor = texture2D( nightTexture, vUv ).rgb;
  
    float cosineAngleSunToNormal = dot(normalize(csm_Normal), sunDirection);
  
    cosineAngleSunToNormal = clamp( cosineAngleSunToNormal * 10.0, -1.0, 1.0);
  
    float mixAmount = cosineAngleSunToNormal * 0.5 + 0.5;
  
    vec3 color = mix( nightColor, dayColor, mixAmount );
  
    csm_DiffuseColor = vec4( color, 1.0 );
  }
  `;

function Earth({ sunPosition }: { sunPosition?: THREE.Vector3 }) {
  const [mapPixels, setMapPixels] = useState<boolean[][]>();

  useEffect(() => {
    loadImage('/bnw_map.png').then((img) => setMapPixels(analyzeImage(img)));
    THREE.Cache.enabled = true;
  }, []);

  return (
    <Suspense fallback={null}>
      <mesh visible={true}>
        <sphereGeometry args={[EARTH_MEAN_RADIUS, 100, 100]} />
        {/* <meshStandardMaterial
                  // {...litHalf}
                  map={useLoader(THREE.TextureLoader, 'blue_marble.jpg')}
                  // color={0x002277}
                  // color={0x22dd22}
                  roughness={0.7}
                  metalness={0.1}
                /> */}

        <CustomShaderMaterial
          baseMaterial={THREE.MeshPhysicalMaterial}
          // vertexShader={vs}
          // fragmentShader={fs}
          silent
          color={0x002277}
          roughness={0.7}
          metalness={0.1}
          uniforms={{
            sunDirection: {
              value: new THREE.Vector3(5000, 2000, 0).normalize(),
            },
            dayTexture: {
              value: new THREE.TextureLoader().load('blue_marble.jpg'),
            },
            nightTexture: {
              value: new THREE.TextureLoader().load('black_marble.jpg'),
            },
          }}
        />
      </mesh>
      {typeof mapPixels !== 'undefined' && true && (
        <Dots rows={120} dotDensity={4.5} map={mapPixels!} />
      )}
    </Suspense>
  );
}

export default Earth;
