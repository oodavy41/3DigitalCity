import * as THREE from "three";

interface RoadMaterialIF {
  cycles: number;
  speeds: number;
  tailSize: number;
  color: THREE.Color;
}

const vert = `
  attribute float roadlength;
  varying float vlength;

  void main() {

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vlength = roadlength;
    gl_Position = projectionMatrix * mvPosition;

  }
`;

const frag = `
  varying float vlength;
  uniform float time;
  uniform float cycles;
  uniform float speeds;
  uniform float tailSize;
  uniform vec3 color;

  varying float opacity;
  varying float voffset;

  void main() {

    float opacity = 0.0;
    opacity += abs(max(mod(time * speeds + vlength, cycles) / cycles - tailSize, 0.0) / (1.0 - tailSize));

    opacity = min(opacity, 1.0);
    gl_FragColor = vec4(color, opacity);
  }
`;

export default class NeoRoadMaterial extends THREE.ShaderMaterial {
  uniforms: {
    time: THREE.IUniform<number>;
    cycles: THREE.IUniform<number>;
    speeds: THREE.IUniform<number>;
    tailSize: THREE.IUniform<number>;
    color: THREE.IUniform<THREE.Color>;
  } = {
    time: { value: 0 },
    cycles: { value: 0 },
    speeds: { value: 0 },
    tailSize: { value: 0 },
    color: { value: new THREE.Color(0xffffff) },
  };

  private _time: number = 0;
  public set time(time: number) {
    this._time = time;
    this.uniforms.time.value = time;
  }
  public get time(): number {
    return this._time;
  }

  private _color: THREE.Color = new THREE.Color(0xffffff);
  public set color(color: THREE.Color) {
    this._color = color;
    this.uniforms.color.value = color;
  }
  public get color(): THREE.Color {
    return this._color;
  }

  private _cycles: number = 0;
  public set cycles(cycles: number) {
    this._cycles = cycles;
    this.uniforms.cycles.value = cycles;
  }
  public get cycles(): number {
    return this._cycles;
  }

  private _speeds: number = 0;
  public set speeds(speeds: number) {
    this._speeds = speeds;
    this.uniforms.speeds.value = speeds;
  }
  public get speeds(): number {
    return this._speeds;
  }

  private _tailSize: number = 0;
  public set tailSize(tailSize: number) {
    this._tailSize = tailSize;
    this.uniforms.tailSize.value = tailSize;
  }
  public get tailSize(): number {
    return this._tailSize;
  }

  constructor(options: RoadMaterialIF) {
    super({
      uniforms: {
        time: { value: 0 },
        cycles: { value: 0 },
        speeds: { value: 0 },
        tailSize: { value: 0 },
        color: { value: new THREE.Color(0xffffff) },
      },
      vertexShader: vert,
      fragmentShader: frag,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false,
      wireframe: false,
    });
    this.time = 0;
    this.cycles = 0 || options.cycles;
    this.speeds = 0 || options.speeds;
    this.tailSize = 0 || options.tailSize;
    this.color = options.color;
  }

  public update(T: number) {
    this.time = T;
  }
}
