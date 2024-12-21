import { EARTH_MEAN_RADIUS } from '@/utils/constants';

import { Suspense } from 'react';
import * as THREE from 'three';

import EarthTextures from './EarthTextures';

const fragmentShader = `
varying vec3 vNormal;
varying vec3 eyeVector;
uniform float atmOpacity;
uniform float atmPowFactor;
uniform float atmMultiplier;

void main() {
    // Starting from the atmosphere edge, dotP would increase from 0 to 1
    float dotP = dot( vNormal, eyeVector );
    // This factor is to create the effect of a realistic thickening of the atmosphere coloring
    float factor = pow(dotP, atmPowFactor) * atmMultiplier;
    // Adding in a bit of dotP to the color to make it whiter while thickening
    vec3 atmColor = vec3(0.35 + dotP/4.5, 0.35 + dotP/4.5, 1.0);
    // use atmOpacity to control the overall intensity of the atmospheric color
    gl_FragColor = vec4(atmColor, atmOpacity * dotP) * factor;

    // (optional) colorSpace conversion for output
    // gl_FragColor = linearToOutputTexel( gl_FragColor );
}
`;

const vertexShader = `
varying vec3 vNormal;
varying vec3 eyeVector;

void main() {
    // modelMatrix transforms the coordinates local to the model into world space
    vec4 mvPos = modelViewMatrix * vec4( position, 1.0 );

    // normalMatrix is a matrix that is used to transform normals from object space to view space.
    vNormal = normalize( normalMatrix * normal );

    // vector pointing from camera to vertex in view space
    eyeVector = normalize(mvPos.xyz);

    gl_Position = projectionMatrix * mvPos;
}
`;

// function Earth({ textures }: { textures?: any }) {
function Earth() {
  // const [mapPixels, setMapPixels] = useState<boolean[][]>();
  // const earthMatRef = React.useRef<THREE.MeshStandardMaterial>(null);
  // useEffect(() => {
  //   loadImage('/bnw_map.png').then((img) => setMapPixels(analyzeImage(img)));
  //   THREE.Cache.enabled = true;
  // }, []);

  // const [scene] = useState(() => new THREE.Scene());

  // console.log('BEFORE USE TEXTURE');
  // const textures = useTexture({
  //   albedoMap: '/earth/Albedo.jpg',
  //   bumpMap: '/earth/Bump.jpg',
  //   oceanMap: '/earth/Ocean.png',
  //   lightsMap: '/earth/night_lights_modified.png',
  //   // envMap: '/earth/starmap_2020_16k.jpg',
  // });
  // console.log('AFTER USE TEXTURE');

  // textures.envMap.mapping = THREE.EquirectangularReflectionMapping;
  // textures.envMap.colorSpace = THREE.SRGBColorSpace;

  // if (textures.albedoMap.image === undefined) return null;

  return (
    <Suspense fallback={null}>
      <group dispose={null}>
        <mesh renderOrder={0}>
          <sphereGeometry args={[EARTH_MEAN_RADIUS, 100, 100]} />
          <EarthTextures />
        </mesh>
        <mesh renderOrder={1}>
          <sphereGeometry args={[EARTH_MEAN_RADIUS * 1.2, 100, 100]} />
          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={{
              atmOpacity: { value: 0.3 },
              atmPowFactor: { value: 2.5 },
              atmMultiplier: { value: 4.0 },
            }}
            blending={THREE.AdditiveBlending}
            transparent={true}
            blendAlpha={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>
        {/* <Environment background map={textures.envMap} /> */}
        {/* {typeof mapPixels !== 'undefined' && false && (
          <Dots rows={120} dotDensity={4.5} map={mapPixels!} />
        )} */}
      </group>
    </Suspense>
  );
}

export default Earth;
