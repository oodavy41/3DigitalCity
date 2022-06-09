import * as THREE from "three";

export default class NeoRoadGeometry extends THREE.BufferGeometry {
  constructor(rawGeo: THREE.BufferGeometry, cycles = 300) {
    super();
    if (!rawGeo.index) {
      console.log("raw road indices is null!!");
      return;
    }
    let vertices = rawGeo.getAttribute("position").array;
    let indices = rawGeo.index.array;
    let newRoadRaw = roadPercentGenrator(vertices, indices, cycles);
    this.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(newRoadRaw.vertics), 3)
    );
    this.setAttribute(
      "roadlength",
      new THREE.BufferAttribute(new Float32Array(newRoadRaw.length), 1)
    );
    this.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
  }
}

export function roadPercentGenrator(
  vertics: ArrayLike<number>,
  indices: ArrayLike<number>,
  cycles: number
) {
  let mutil = 0.8 + Math.random() * 0.4;
  let roadlength: number[] = [],
    newVertics: number[] = [],
    newIndices: number[] = [];
  for (let i = 0; i < indices.length; i += 2) {
    if (i === 0 || indices[i] !== indices[i - 1]) {
      if (i !== 0) {
      }
      handleSegmentStart(i);
    }
    handleSegmentAdd(i);
  }

  function handleSegmentStart(faceIndex: number) {
    let offset = cycles + Math.random() * 2 * cycles;
    mutil = 0.8 * Math.random() * 0.4;
    let index = indices[faceIndex];
    newVertics.push(
      vertics[index * 3],
      vertics[index * 3 + 1],
      vertics[index * 3 + 2]
    );
    roadlength.push(offset);
  }
  function handleSegmentAdd(faceIndex: number) {
    let nextIndex = indices[faceIndex + 1];
    newVertics.push(
      vertics[nextIndex * 3],
      vertics[nextIndex * 3 + 1],
      vertics[nextIndex * 3 + 2]
    );
    roadlength.push(
      roadlength[roadlength.length - 1] + calcuateDistance(mutil)
    );
    newIndices.push(newVertics.length / 3 - 2, newVertics.length / 3 - 1);
  }

  function calcuateDistance(mutil: number) {
    let lastIndex = newVertics.length / 3 - 1;
    let dx = newVertics[lastIndex * 3] - newVertics[lastIndex * 3 - 3];
    let dy = newVertics[lastIndex * 3 + 1] - newVertics[lastIndex * 3 - 2];
    let dz = newVertics[lastIndex * 3 + 2] - newVertics[lastIndex * 3 - 1];
    return Math.sqrt(dx * dx + dy * dy + dz * dz) * mutil;
  }

  return {
    vertics: newVertics,
    indices: newIndices,
    length: roadlength,
  };
}
