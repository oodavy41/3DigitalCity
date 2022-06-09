import * as THREE from "three";

interface BuildingMaterialIF {
  scaningCenter: THREE.Vector3;
  scaningRadius: number;
  scaningSpeed: number;
  darkLevel: number;
  lightLevel: number;
  lightLevelDistance: number;
  color: THREE.Color;
  darkColor: THREE.Color;
  lightColor: THREE.Color;
  scaningColor: THREE.Color;
  time?: number;
  blooming?: number;
}

type getUniforms<T> = {
  [key in keyof T]: T extends { [key in keyof T]: infer U }
    ? THREE.IUniform<U>
    : never;
};
type valueOf<T> = T extends { [key in keyof T]: infer U } ? U : never;

const vert = `
  uniform vec3 scaningCenter;
  uniform float scaningRadius;
  uniform float scaningSpeed;
  uniform float time;

  varying float height;
  varying float scaningPow;

  void main() {

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    height = position.y;
    vec3 direction = position - scaningCenter;
    float degree = degrees(atan(-direction.z,direction.x));
    degree=step(0.0,degree)*degree+step(degree,0.0)*(360.0+degree);
    float delta = mod(time * scaningSpeed-degree,360.0);
    scaningPow = step(distance(position,scaningCenter),scaningRadius)
      *(step(delta,60.0)*(60.0-delta)/60.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const frag = `
  uniform float blooming;
  uniform float darkLevel;
  uniform float lightLevel;
  uniform float lightLevelDistance;
  uniform vec3 color;
  uniform vec3 darkColor;
  uniform vec3 lightColor;
  uniform vec3 scaningColor;

  varying float height;
  varying float scaningPow;

  void main() {
    vec3 bcolor = step(lightLevel,height) * mix( color, lightColor, 
      step( 0.1, 
        mod( height - lightLevel, lightLevelDistance)/ lightLevelDistance
      )
    ) + 
    mix(darkColor, color, 
      smoothstep(0.0,darkLevel,height)
    );
    bcolor = step(blooming,0.5)*bcolor + 
      step(0.5,blooming)*
      step( 0.9, 
          mod( height - lightLevel, lightLevelDistance)/ lightLevelDistance
      )*lightColor;

    gl_FragColor = vec4(mix(bcolor,scaningColor,scaningPow), 1.0);
  }
`;

export default class BuildingMaterial extends THREE.ShaderMaterial {
  uniforms: getUniforms<BuildingMaterialIF> = {
    scaningCenter: { value: new THREE.Vector3() },
    scaningRadius: { value: 0 },
    scaningSpeed: { value: 0 },
    darkLevel: { value: 0 },
    lightLevel: { value: 0 },
    lightLevelDistance: { value: 0 },
    color: { value: new THREE.Color() },
    darkColor: { value: new THREE.Color() },
    lightColor: { value: new THREE.Color() },
    scaningColor: { value: new THREE.Color() },
    blooming: { value: 0 },
    time: { value: 0 },
  };

  setter(key: keyof BuildingMaterialIF, value: valueOf<BuildingMaterialIF>) {
    this.uniforms[key]!.value = value;
  }
  getter(key: keyof BuildingMaterialIF) {
    return this.uniforms[key]!.value;
  }

  constructor(options: BuildingMaterialIF) {
    super({
      uniforms: {
        scaningCenter: { value: new THREE.Vector3() },
        scaningRadius: { value: 0 },
        scaningSpeed: { value: 0 },
        darkLevel: { value: 0 },
        lightLevel: { value: 0 },
        lightLevelDistance: { value: 0 },
        color: { value: new THREE.Color() },
        darkColor: { value: new THREE.Color() },
        lightColor: { value: new THREE.Color() },
        scaningColor: { value: new THREE.Color() },
        blooming: { value: 0 },
        time: { value: 0 },
      },
      vertexShader: vert,
      fragmentShader: frag,
      side: THREE.FrontSide,
    });
    let key: keyof BuildingMaterialIF;
    for (key in options) {
      if (options[key]) this.setter(key, options[key]!);
    }
  }

  public update(T: number) {
    this.setter("time", T);
  }
  public setRaderOptions(center?: THREE.Vector3, color?: THREE.Color) {
    if (center) this.uniforms.scaningCenter.value = center;
    if (color) this.uniforms.scaningColor.value = color;
  }
}
