import { useTexture } from '@react-three/drei';
import React from 'react';
import * as THREE from 'three';

export default function EarthTextures() {
  const textures = useTexture({
    albedoMap: '/earth/Albedo.jpg',
    bumpMap: '/earth/Bump.jpg',
    oceanMap: '/earth/Ocean.png',
    lightsMap: '/earth/night_lights_modified.png',
    // envMap: '/earth/starmap_2020_16k.jpg',
  });

  if (textures) {
    textures.albedoMap.colorSpace = THREE.SRGBColorSpace;

    return (
      <meshStandardMaterial
        map={textures.albedoMap}
        bumpMap={textures.bumpMap}
        bumpScale={2}
        roughnessMap={textures.oceanMap}
        metalness={0.2}
        metalnessMap={textures.oceanMap}
        emissiveMap={textures.lightsMap}
        emissive={new THREE.Color(0xffff88)}
        onBeforeCompile={earthShaderOBC}
      />
    );
  }
}

function earthShaderOBC(shader: any) {
  // !!                         ^^^
  // shader.uniforms.tClouds = { value: textures.cloudsMap };
  // shader.uniforms.tClouds.value.wrapS = THREE.RepeatWrapping;
  // shader.uniforms.uv_xOffset = { value: 0 };
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <common>',
    `
       #include <common>
       uniform sampler2D tClouds;
       uniform float uv_xOffset;
     `,
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <roughnessmap_fragment>',
    `
       float roughnessFactor = roughness;

       #ifdef USE_ROUGHNESSMAP

         vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
         // reversing the black and white values because we provide the ocean map
         texelRoughness = vec4(1.0) - texelRoughness;

         // reads channel G, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
         roughnessFactor *= clamp(texelRoughness.g, 0.5, 1.0);

       #endif
     `,
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <emissivemap_fragment>',
    `
       #ifdef USE_EMISSIVEMAP

         vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );

         // Methodology of showing night lights only:
         //
         // going through the shader calculations in the meshphysical shader chunks (mostly on the vertex side),
         // we can confirm that geometryNormal is the normalized normal in view space,
         // for the night side of the earth, the dot product between geometryNormal and the directional light would be negative
         // since the direction vector actually points from target to position of the DirectionalLight,
         // for lit side of the earth, the reverse happens thus emissiveColor would be multiplied with 0.
         // The smoothstep is to smoothen the change between night and day

         emissiveColor *= 1.0 - smoothstep(-0.15, 0.1, dot(normal, directionalLights[0].direction));

         totalEmissiveRadiance *= emissiveColor.rgb;

       #endif

       // Methodology explanation:
       //
       // Our goal here is to use a “negative light map” approach to cast cloud shadows,
       // the idea is on any uv point on earth map(Point X),
       // we find the corresponding uv point(Point Y) on clouds map that is directly above Point X,
       // then we extract color value at Point Y.
       // We then darken the color value at Point X depending on the color value at Point Y,
       // that is the intensity of the clouds at Point Y.
       //
       // Since the clouds are made to spin twice as fast as the earth,
       // in order to get the correct shadows(clouds) position in this earth's fragment shader
       // we need to minus earth's UV.x coordinate by uv_xOffset,
       // which is calculated and explained in the updateScene()
       // after minus by uv_xOffset, the result would be in the range of -1 to 1,
       // we need to set RepeatWrapping for wrapS of the clouds texture so that texture2D still works for -1 to 0

       //// float cloudsMapValue = texture2D(tClouds, vec2(vMapUv.x - uv_xOffset, vMapUv.y)).r;

       // The shadow should be more intense where the clouds are more intense,
       // thus we do 1.0 minus cloudsMapValue to obtain the shadowValue, which is multiplied to diffuseColor
       // we also clamp the shadowValue to a minimum of 0.2 so it doesn't get too dark

       //// diffuseColor.rgb *= max(1.0 - cloudsMapValue, 0.2 );

       // adding small amount of atmospheric coloring to make it more realistic
       // fine tune the first constant for stronger or weaker effect
       float intensity = 1.0 - dot( normal, vec3( 0.0, 0.0, 1.0 ) );
       vec3 atmosphere = vec3( 0.3, 0.6, 1.0 ) * pow(intensity, 5.0);
       diffuseColor.rgb += atmosphere;
     `,
  );

  // need save to userData.shader in order to enable our code to update values in the shader uniforms,
  // reference from https://github.com/mrdoob/three.js/blob/master/examples/webgl_materials_modified.html
  // earthMat.userData.shader = shader;
}
