import * as THREE from "three";
import { Water } from "./water";

import NeoRoadMat from "./NeoRoadMat";
import NeoRoadGeometry from "./NeoRoadGeometry";

import { ShaderMaterial } from "three";
import BuildingMaterial from "./buildingMat";

export default function modelHandle(group: THREE.Group) {
  let highway: THREE.LineSegments;
  group.children = group.children.map((object) => {
    console.log(object.name);
    let key: keyof typeof handlerFunc = object.name as keyof typeof handlerFunc;
    if (handlerFunc[key]) {
      let newchild = handlerFunc[key](
        object as THREE.LineSegments & THREE.Mesh
      );
      if (key === "Wayshighway") {
        highway = newchild as THREE.LineSegments;
        for (let i = 0; i < 0; i++) {
          let newHW = genrateNeoRoad(highway, {
            color: new THREE.Color("#ffa"),
            speeds: -0.05 - Math.random() * 0.1,
            cycles: 150 + Math.random() * 100,
            tailSize: 0.1 + Math.random() * 0.2,
          });
          newHW.position.y += 15;
          copyState(newHW, highway);
          group.add(newHW);
        }
      }
      return newchild;
    } else {
      return new THREE.Object3D();
    }
  });
}

let handlerFunc: {
  [key: string]: (obj: THREE.LineSegments & THREE.Mesh) => (
    | THREE.LineSegments
    | THREE.Mesh
  ) & {
    update?: (T: number) => void;
    onBloom?: (flag: boolean) => void;
  };
} = {
  Wayshighway: (obj: THREE.LineSegments) => {
    let neoObj = genrateNeoRoad(obj, {
      speeds: -0.1,
      cycles: 200,
      color: new THREE.Color("#ffa"),
      tailSize: 0.1,
    });
    copyState(neoObj, obj);
    neoObj.position.y += 15;
    return neoObj;
  },
  Waysrailway: (obj: THREE.LineSegments) => {
    let neoObj = genrateNeoRoad(obj, {
      color: new THREE.Color("#5ff"),
      speeds: -2.5,
      cycles: 10000,
      tailSize: 0.5,
    });
    copyState(neoObj, obj);
    neoObj.position.y += 10;
    return neoObj;
  },
  Wayswaterway: (obj: THREE.LineSegments) => {
    obj.visible = false;
    return obj;
  },
  Waysnatural: (obj: THREE.LineSegments) => {
    obj.visible = false;
    return obj;
  },
  Areasbuilding: (obj: THREE.Mesh) => {
    obj.material = new BuildingMaterial({
      color: new THREE.Color("#787898"),
      darkColor: new THREE.Color("#222"),
      lightColor: new THREE.Color("#000"),
      scaningColor: new THREE.Color("#557766"),
      scaningCenter: new THREE.Vector3(-3000, 0, 1300),
      scaningRadius: 800,
      scaningSpeed: 100,
      darkLevel: 60,
      lightLevel: 240,
      lightLevelDistance: 60,
    });
    type buildingObj = typeof obj & {
      update: (T: number) => void;
      onBloom: (flag: boolean) => void;
      raderOption: (center: THREE.Vector3, color: THREE.Color) => void;
    };
    (obj as buildingObj)["update"] = (T) => {
      T = T * 0.001;
      (obj.material as THREE.ShaderMaterial).uniforms.time.value = T;
    };
    obj.layers.enable(2);
    (obj as buildingObj)["onBloom"] = (bloom: boolean) => {
      if ((obj.material as THREE.ShaderMaterial).uniforms.blooming) {
        (obj.material as THREE.ShaderMaterial).uniforms.blooming.value = bloom
          ? 1
          : 0;
      }
    };
    (obj as buildingObj)["raderOption"] = (center, color) => {
      (obj.material as BuildingMaterial).setRaderOptions(center, color);
    };

    return obj;
  },
  Areasnatural: (obj: THREE.Mesh) => {
    let oldobj = obj;
    obj = new Water(obj.geometry, {
      textureWidth: 1024,
      textureHeight: 1024,
      waterNormals: new THREE.TextureLoader().load(
        "/terminal3D/waternormals.jpg",
        function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      fog: true,
      waterColor: new THREE.Color(0x012e3f),
      distortionScale: 2.7,
      size: 200,
    });
    copyState(obj, oldobj);
    obj.position.y -= 10;
    (
      obj as Water & {
        update?: (T: number) => void;
        onBloom?: (flag: boolean) => void;
      }
    )["update"] = (T) => {
      T = T * 0.001;
      (obj.material as THREE.ShaderMaterial).uniforms.time.value = T;
      (obj.material as THREE.ShaderMaterial).uniforms.distortionScale.value =
        Math.sin(T * 0.1) * 0.22 + 0.3;
    };
    return obj;
  },
  Areasleisure: (obj: THREE.Mesh) => {
    (obj as THREE.Mesh).material = new THREE.MeshBasicMaterial({
      color: "#339",
    });
    return obj;
  },
  Areaslanduse: (obj: THREE.Mesh) => {
    (obj as THREE.Mesh).material = new THREE.MeshBasicMaterial({
      color: "#669",
    });
    obj.position.y = 0.1;
    return obj;
  },
};

function genrateNeoRoad(
  road: THREE.LineSegments,
  option?: {
    color?: THREE.Color;
    speeds?: number;
    cycles?: number;
    tailSize?: number;
  }
) {
  let merge_option: {
    color: THREE.Color;
    speeds: number;
    cycles: number;
    tailSize: number;
  } = {
    ...{
      color: new THREE.Color("#fff"),
      speeds: -0.1,
      cycles: 300,
      tailSize: 0.3,
    },
    ...option,
  };
  let neoRoad: THREE.LineSegments & {
    material: NeoRoadMat;
    update?: (T: number) => void;
  } = new THREE.LineSegments(
    new NeoRoadGeometry(road.geometry, merge_option.cycles || 300),
    // new THREE.LineBasicMaterial()
    new NeoRoadMat({
      color: merge_option.color,
      cycles: merge_option.cycles,
      speeds: merge_option.speeds,
      tailSize: merge_option.tailSize,
    })
  );
  neoRoad.update = (T) => (neoRoad.material.time = T);
  neoRoad.layers.enable(2);
  return neoRoad;
}

function copyState(last: THREE.Object3D, recent: THREE.Object3D) {
  last.matrix.copy(recent.matrix);
  last.parent = recent.parent;
  last.matrixWorldNeedsUpdate = true;
  last.name = recent.name;
}
