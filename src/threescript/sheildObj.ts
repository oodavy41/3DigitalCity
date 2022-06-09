import * as THREE from "three";
const vert = `
  varying vec3 vnormal;
  varying float vheight;

  void main() {

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vheight = position.y;
    vnormal = normalMatrix * normal;
    gl_Position = projectionMatrix * mvPosition;

  }
`;

const frag = `
  uniform vec3 color;

  varying vec3 vnormal;
  varying float vheight;

  void main() {
    float opacityBase=0.1;
    float vecDot = 1.0 - abs(dot(normalize(vnormal),vec3(0.0,0.0,1.0)));
    float opacity = 0.0;
    if ( vecDot > opacityBase ){
      opacity = (vecDot-opacityBase)/(1.0-opacityBase);
    }
    if ( vheight < 0.0 ){
      opacity=0.0;
    }
    gl_FragColor =vec4(color , opacity);

  }
`;
export default class SheildObj extends THREE.Mesh {
  constructor() {
    super(
      new THREE.SphereGeometry(10, 32, 32),
      new THREE.ShaderMaterial({
        uniforms: { color: { value: new THREE.Color("#880000") } },
        fragmentShader: frag,
        vertexShader: vert,
        transparent: true,
        // depthTest: false,
        depthWrite: false,
      })
    );
    this.layers.enable(2);
    this.geometry.computeVertexNormals();
  }
}
