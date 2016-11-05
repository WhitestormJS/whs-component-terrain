import * as THREE from 'three';
import * as Physijs from 'whitestormjs/physics/index';

import {Component, MeshComponent, PhysicsComponent, TextureLoader} from 'whs';
import shaderTerrain from './shaders/ShaderTerrain';
import {presets, loadPerset} from './presets';

@PhysicsComponent
@MeshComponent
export default class Terrain extends Component {
  static defaults = {
    geometry: {
      width: 1,
      height: 1,
      depth: 1,
      map: false,
      normalMap: false
    }
  }

  constructor(params = {}) {
    super(params, Terrain.defaults, Terrain.instructions);

    this.build(params);
    super.wrap().then((obj) => {
      obj.rotation.set(Math.PI / 180 * -90, 0, 0);
    });
  }

  build(params = {}) {
    const promise = new Promise((resolve) => {
      const rx = params.geometry.width,
        ry = params.geometry.height;

      const canvas = document.createElement('canvas');
      canvas.setAttribute('width', rx);
      canvas.setAttribute('height', ry);

      const textures = typeof params.material[0] === 'string'
        ? loadPerset(presets()[params.material[0]], params.material[1])
        : params.material;

      const pars = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,

        format: THREE.RGBFormat
      };

      const heightMapTexture = TextureLoader.load(params.geometry.map, (texture) => {
        // Heightmap.
        const heightMap = new THREE.WebGLRenderTarget(rx, ry, pars);
        heightMap.texture = texture;

        this.heightMap = heightMap;

        // Terrain shader (ShaderTerrain.js).
        const terrainShader = shaderTerrain(textures).terrain;
        const uniformsTerrain = Object.assign(
          THREE.UniformsUtils.clone(terrainShader.uniforms),
          {
            fog: true,
            lights: true
          },

          THREE.UniformsLib.common,
          THREE.UniformsLib.fog,
          THREE.UniformsLib.lights,
          THREE.UniformsLib.ambient,
          THREE.UniformsLib.shadowmap,

          {
            ambient: {type: 'c', value: new THREE.Color(0xffffff)},
            emissive: {type: 'c', value: new THREE.Color(0x000000)},
            wrapRGB: {type: 'v3', value: new THREE.Vector3(1, 1, 1)}
          }
        );

        uniformsTerrain.tDisplacement.value = heightMap;

        uniformsTerrain.uDisplacementScale.value = 100;
        uniformsTerrain.uRepeatOverlay.value.set(6, 6);

        for (let i = 0; i < textures.length; i++)
          uniformsTerrain[`textureBound${i}`] = {type: 't', value: textures[i].texture};

        const material = new THREE.ShaderMaterial({
          uniforms: uniformsTerrain,
          vertexShader: terrainShader.vertexShader,
          fragmentShader: terrainShader.fragmentShader,
          lights: true,
          fog: true,
          side: THREE.FrontSide,
          shading: THREE.SmoothShading
        });

        const geom = new THREE.PlaneBufferGeometry(rx, ry, rx - 1, ry - 1);
        geom.verticesNeedUpdate = true;

        let index = 0;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(texture.image, 0, 0);

        const imgdata = ctx.getImageData(0, 0, rx, ry).data;
        const verts = geom.attributes.position.array;
        const depth = params.geometry.depth;

        for (let x = 0; x < rx; x++) {
          for (let y = ry - 1; y >= 0; y--) {
            verts[index * 3 + 2] = imgdata[index * 4] / 255 * depth;
            index++;
          }
        }

        geom.computeVertexNormals();
        geom.computeFaceNormals();
        geom.computeTangents();

        this.native = new Physijs.HeightfieldMesh(
          geom,
          material,
          this.params
        );

        this.native.updateMatrix();
        resolve();
      });
    });

    super.wait(promise);
    return promise;
  }

  clone() {
    return new Terrain({build: false}).copy(this);
  }
}
