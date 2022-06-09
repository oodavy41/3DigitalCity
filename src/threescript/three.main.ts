import { render } from "react-dom";
import * as THREE from "three";

import { FlyControls } from "three/examples/jsm/controls/FlyControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import modelHandle from "./modelHandle";
import NeoRoadMaterial from "./NeoRoadMat";
import CrossCube from "./crossCube";
import SheildObj from "./sheildObj";

let width = 1920,
  height = 1080;

export function threeInit(container: HTMLDivElement) {
  let camera = new THREE.PerspectiveCamera(45, width / height, 0.25, 100);
  camera.position.set(0, 10, 0);

  let scene = new THREE.Scene();
  let renderer = new THREE.WebGLRenderer({ antialias: true });
  scene.add(new THREE.AmbientLight("#fff", 0.5));
  let directLight = new THREE.DirectionalLight("#aaf", 0.6);
  directLight.lookAt(-1, -1, -1);
  scene.add(directLight);

  const loader = new GLTFLoader();
  loader.load("/terminal3D/ptBig.glb", function (gltf) {
    modelHandle(gltf.scene);

    console.log(gltf.scene);
    scene.add(gltf.scene);
    gltf.scene.scale.set(0.001, 0.001, 0.001);
  });

  CrossCube("/terminal3D/sky2.png", scene);
  scene.fog = new THREE.Fog(0x003, 1, 15);
  let sheild = new SheildObj();
  sheild.scale.set(0.05, 0.05, 0.05);
  sheild.position.set(1, 0, 1);
  scene.add(sheild);

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(1920, 1000);
  renderer.setClearColor("#003");
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  const controls = new FlyControls(camera, renderer.domElement);
  controls.movementSpeed = 0.003;
  controls.domElement = renderer.domElement;
  controls.rollSpeed = Math.PI / 3600;
  controls.autoForward = false;
  controls.dragToLook = true;
  camera.position.set(10, 10, 10);
  camera.lookAt(1, 1, 1);

  window.addEventListener("resize", onWindowResize);

  function onWindowResize() {
    width = container.clientWidth;
    height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }

  // bloom post process
  const params = {
    exposure: 1.1,
    bloomStrength: 1.2,
    bloomThreshold: 0,
    bloomRadius: 0.2,
  };
  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    1.1,
    0.2,
    0.85
  );
  bloomPass.threshold = params.bloomThreshold;
  bloomPass.strength = params.bloomStrength;
  bloomPass.radius = params.bloomRadius;

  let bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);

  const finalPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {

          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

        }
        `,
      fragmentShader: `
        uniform sampler2D baseTexture;
        uniform sampler2D bloomTexture;

        varying vec2 vUv;

        void main() {

          gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

        }
        `,
      defines: {},
    }),
    "baseTexture"
  );
  finalPass.needsSwap = true;

  const finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderScene);
  finalComposer.addPass(finalPass);
  function bloomProcess() {
    // camera.layers.disable(0);
    // camera.layers.enable(1);
    renderer.setClearColor("#000");
    let matBackup: { [key: string]: THREE.Material } = {};
    let skyboxBackup = scene.background;
    let fogBackup = scene.fog;
    let darkMat = new THREE.MeshBasicMaterial({ color: "#000" });
    let bloomLayers = new THREE.Layers();
    bloomLayers.disableAll();
    bloomLayers.enable(2);
    scene.traverse((child) => {
      if (!child.layers.test(bloomLayers)) {
        matBackup[child.uuid] = (child as THREE.Mesh)
          .material as THREE.Material;
        (child as THREE.Mesh).material = darkMat;
      } else {
        if (
          (child as THREE.Mesh & { onBloom: (flag: boolean) => void }).onBloom
        ) {
          (child as THREE.Mesh & { onBloom: (flag: boolean) => void }).onBloom(
            true
          );
        }
      }
    });
    scene.fog = new THREE.Fog(0x000, 1, 10);
    scene.background = null;
    renderer.setClearColor("#000");
    bloomComposer.render();
    scene.traverse((child) => {
      if (matBackup[child.uuid]) {
        (child as THREE.Mesh).material = matBackup[child.uuid];
      }
      if (
        child.layers.test(bloomLayers) &&
        (child as THREE.Mesh & { onBloom: (flag: boolean) => void }).onBloom
      ) {
        (child as THREE.Mesh & { onBloom: (flag: boolean) => void }).onBloom(
          false
        );
      }
    });
    scene.fog = fogBackup;
    scene.background = skyboxBackup;
    // camera.layers.enable(0);
    renderer.setClearColor("#003");
  }

  let delta = (() => {
    let last = 0;
    return function (now: number) {
      let delta = now - last;
      last = now;
      return delta;
    };
  })();
  renderloop(0);

  let updateOptions = {
    name: "Areasbuilding",
    raderCenter: new THREE.Vector3(-2000, 0, 2000),
    raderColor: new THREE.Color(0x99ff44),
  };

  function renderloop(T: number) {
    let d = delta(T);
    controls.update(d);
    renderer.render(scene, camera);
    scene.traverse((obj) => {
      (
        obj as THREE.Object3D & {
          update: (T: number) => void;
        }
      ).update?.(T);
      if (obj.name === "Areasbuilding") {
        (
          obj as THREE.Object3D & {
            raderOption: (center: THREE.Vector3, color: THREE.Color) => void;
          }
        ).raderOption(updateOptions.raderCenter, updateOptions.raderColor);
      }
    });
    bloomProcess();
    finalComposer.render();
    requestAnimationFrame(renderloop);
  }
  onWindowResize();
  return {
    setSheild: (option: { center?: THREE.Vector3; color?: THREE.Color }) => {
      let { center, color } = option;
      if (center) {
        sheild.position.copy(center);
      }
      if (color)
        (sheild.material as THREE.ShaderMaterial).uniforms.color.value = color;
    },
    setRader: (option: { center?: THREE.Vector3; color?: THREE.Color }) => {
      let { center, color } = option;
      if (center) {
        updateOptions.raderCenter.copy(center);
      }
      if (color) updateOptions.raderColor = color;
    },
  };
}
