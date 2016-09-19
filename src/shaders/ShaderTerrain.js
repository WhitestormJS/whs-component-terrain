import * as THREE from 'three';

export default function shaderTerrain(textures) {
  const defineTex = [];
  const typeTex = [];
  const nameTex = [];

  for (let i = 0; i < textures.length; i++) {
    defineTex.push(`uniform sampler2D textureBound${i};`);

    if (textures[i].to) {
      typeTex.push(`
        vec4 tex${i} = (smoothstep(${textures[i].from[0]}${textures[i].from[0] % 1 === 0 ? '.0' : ''}, ${textures[i].from[1]}${textures[i].from[1] % 1 === 0 ? '.0' : ''}, vAmount)
        - smoothstep(${textures[i].to[0]}${textures[i].to[0] % 1 === 0 ? '.0' : ''}, ${textures[i].to[1]}${textures[i].to[1] % 1 === 0 ? '.0' : ''}, vAmount))
        * texture2D( textureBound${i}, vUv * ${textures[i].scale}${textures[i].scale % 1 === 0 ? '.0' : ''} );
      `);
    } else {
      typeTex.push(`
        vec4 tex${i} = (smoothstep(${textures[i].from[0]}${textures[i].from[0] % 1 === 0 ? '.0' : ''}, ${textures[i].from[1]}${textures[i].from[1] % 1 === 0 ? '.0' : ''}, vAmount))
        * texture2D( textureBound${i}, vUv * ${textures[i].scale}${textures[i].scale % 1 === 0 ? '.0' : ''} );
      `);
    }

    nameTex.push(` + tex${i}`);
  }

  return {
    terrain: {
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        THREE.UniformsLib.lights,
        THREE.UniformsLib.shadowmap,

        {
          enableDiffuse1: {type: 'i', value: 0},
          enableDiffuse2: {type: 'i', value: 0},
          enableSpecular: {type: 'i', value: 0},
          enableReflection: {type: 'i', value: 0},

          tDiffuse1: {type: 't', value: null},
          tDiffuse2: {type: 't', value: null},
          tDetail: {type: 't', value: null},
          tNormal: {type: 't', value: null},
          tSpecular: {type: 't', value: null},
          tDisplacement: {type: 't', value: null},

          uNormalScale: {type: 'f', value: 1.0},

          uDisplacementBias: {type: 'f', value: 0.0},
          uDisplacementScale: {type: 'f', value: 1.0},

          diffuse: {type: 'c', value: new THREE.Color(0xeeeeee)},
          specular: {type: 'c', value: new THREE.Color(0x111111)},
          shininess: {type: 'f', value: 30},
          opacity: {type: 'f', value: 1},

          uRepeatBase: {type: 'v2', value: new THREE.Vector2(1, 1)},
          uRepeatOverlay: {type: 'v2', value: new THREE.Vector2(1, 1)},

          uOffset: {type: 'v2', value: new THREE.Vector2(0, 0)}
        }
      ]),

      fragmentShader: `
        uniform vec3 diffuse;
        uniform vec3 emissive;
        uniform float opacity;
        varying vec3 vLightFront;
        varying vec3 vLightBack;
        uniform vec2 uRepeatOverlay;
        uniform vec2 uRepeatBase;
        uniform vec2 uOffset;
        uniform float uNormalScale;
        uniform sampler2D tNormal;
        ${defineTex.join('\n')}
        varying vec3 vTangent;
        varying vec3 vBinormal;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
      
      ${
        [
          THREE.ShaderChunk.common,
          THREE.ShaderChunk.packing,
          THREE.ShaderChunk.color_pars_fragment,
          THREE.ShaderChunk.uv_pars_fragment,
          THREE.ShaderChunk.uv2_pars_fragment,
          THREE.ShaderChunk.map_pars_fragment,
          THREE.ShaderChunk.alphamap_pars_fragment,
          THREE.ShaderChunk.aomap_pars_fragment,
          THREE.ShaderChunk.lightmap_pars_fragment,
          THREE.ShaderChunk.emissivemap_pars_fragment,
          THREE.ShaderChunk.envmap_pars_fragment,
          THREE.ShaderChunk.bsdfs,
          THREE.ShaderChunk.ambient_pars,
          THREE.ShaderChunk.lights_pars,
          THREE.ShaderChunk.fog_pars_fragment,
          THREE.ShaderChunk.shadowmap_pars_fragment,
          THREE.ShaderChunk.shadowmask_pars_fragment,
          THREE.ShaderChunk.specularmap_pars_fragment
        ].join('\n')
      }

        varying vec2 vUv;
        varying float vAmount;
        void main() {
          // UVs.
          vec2 uvOverlay = uRepeatOverlay * vUv + uOffset;
          vec2 uvBase = uRepeatBase * vUv;
          vec3 specularTex = vec3( 1.0 );
          vec3 normalTex = texture2D( tNormal, uvOverlay ).xyz * 2.0 - 1.0;
          normalTex.xy *= uNormalScale;
          normalTex = normalize( normalTex );
          mat3 tsb = mat3( vTangent, vBinormal, vNormal );

          vec3 finalNormal = tsb * normalTex;
          vec3 normal = normalize( finalNormal );
          vec3 viewPosition = normalize( vViewPosition );
          vec3 shadowMask = vec3( 1.0 );
          vec3 totalAmbientLight = ambientLightColor;
          vec4 diffuseColor = vec4(0.0);

          // Color by texture.
          ${typeTex.join('\n')}

          diffuseColor = vec4(0.0, 0.0, 0.0, 1.0)
          ${nameTex.join('')};

          ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
          vec3 totalEmissiveLight = emissive;
      ${
        [
          THREE.ShaderChunk.logdepthbuf_fragment,
          THREE.ShaderChunk.map_fragment,
          THREE.ShaderChunk.color_fragment,
          THREE.ShaderChunk.alphamap_fragment,
          THREE.ShaderChunk.alphatest_fragment,
          THREE.ShaderChunk.specularmap_fragment,
          THREE.ShaderChunk.emissivemap_fragment
        ].join('\n')
      }
          reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );
     

      ${THREE.ShaderChunk.lightmap_fragment}

          reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );

          #ifdef DOUBLE_SIDED

            reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;

          #else

            reflectedLight.directDiffuse = vLightFront;

          #endif

          reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();
      
      ${THREE.ShaderChunk.aomap_fragment}

          vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveLight;

          gl_FragColor = vec4( outgoingLight, diffuseColor.a );
      
      ${
        [
          THREE.ShaderChunk.envmap_fragment,
          THREE.ShaderChunk.linear_to_gamma_fragment,
          THREE.ShaderChunk.fog_fragment
        ].join('\n')
      }

          }
      `,

      vertexShader: `
        #define TERRAIN;
        varying vec3 vLightFront;
        #ifdef DOUBLE_SIDED
          varying vec3 vLightBack;
        #endif
        
        varying float vAmount;
        attribute vec4 tangent;
        uniform vec2 uRepeatBase;
        uniform sampler2D tNormal;
        #ifdef VERTEX_TEXTURES
          uniform sampler2D tDisplacement;
          uniform float uDisplacementScale;
          uniform float uDisplacementBias;
        #endif
        varying vec3 vTangent;
        varying vec3 vBinormal;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vViewPosition;
      
      ${
        [
          THREE.ShaderChunk.common,
          THREE.ShaderChunk.uv_pars_vertex,
          THREE.ShaderChunk.uv2_pars_vertex,
          THREE.ShaderChunk.envmap_pars_vertex,
          THREE.ShaderChunk.bsdfs,
          THREE.ShaderChunk.lights_pars,
          THREE.ShaderChunk.color_pars_vertex,
          THREE.ShaderChunk.morphtarget_pars_vertex,
          THREE.ShaderChunk.skinning_pars_vertex,
          THREE.ShaderChunk.shadowmap_pars_vertex,
          THREE.ShaderChunk.logdepthbuf_pars_vertex
        ].join('\n')
      }

        void main() {
      
      ${
        [
          THREE.ShaderChunk.uv_vertex,
          THREE.ShaderChunk.uv2_vertex,
          THREE.ShaderChunk.color_vertex,

          THREE.ShaderChunk.beginnormal_vertex,
          THREE.ShaderChunk.morphnormal_vertex,
          THREE.ShaderChunk.skinbase_vertex,
          THREE.ShaderChunk.skinnormal_vertex,
          THREE.ShaderChunk.defaultnormal_vertex,

          THREE.ShaderChunk.begin_vertex,
          THREE.ShaderChunk.morphtarget_vertex,
          THREE.ShaderChunk.skinning_vertex,
          THREE.ShaderChunk.project_vertex,
          THREE.ShaderChunk.logdepthbuf_vertex,

          THREE.ShaderChunk.worldpos_vertex
        ].join('\n')
      }

          vNormal = normalize( normalMatrix * normal);
          // Tangent and binormal vectors.
          vTangent = normalize( normalMatrix * tangent.xyz );
          vBinormal = cross( vNormal, vTangent ) * tangent.w;
          vBinormal = normalize( vBinormal );
          // Texture coordinates.
          vUv = uv;
          vec2 uvBase = uv * uRepeatBase;
          // displacement mapping
          // worldPosition = modelMatrix * vec4( position.xyz, 1.0 );
          mvPosition = modelViewMatrix * vec4( position, 1.0 );
          transformedNormal = normalize( normalMatrix * normal );
          gl_Position = projectionMatrix * mvPosition;
          vViewPosition = -mvPosition.xyz;
          vAmount = position.z * 0.005 + 0.1;
      
      ${
        [
          THREE.ShaderChunk.envmap_vertex,
          THREE.ShaderChunk.lights_lambert_vertex,
          THREE.ShaderChunk.shadowmap_vertex
        ].join('\n')
      }

         }
      `,

      side: THREE.DoubleSide,
      shading: THREE.SmoothShading
    }
  };
}
