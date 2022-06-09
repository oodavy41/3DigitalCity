import * as THREE from "three";

const crossArray = [
  [2, 1],
  [0, 1],
  [1, 0],
  [1, 2],
  [1, 1],
  [3, 1],
];

export default function CrossCube(url: string, scene: THREE.Scene) {
  let loader = new THREE.ImageLoader();
  loader.load(url, (image) => {
    const size = image.naturalWidth / 4;
    let images = [];
    for (let i = 0; i < 6; i++) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = size;
      canvas.height = size;
      context!.drawImage(
        image,
        crossArray[i][0] * size,
        crossArray[i][1] * size,
        size,
        size,
        0,
        0,
        size,
        size
      );
      images.push(canvas.toDataURL("image/png"));
      // document.body.appendChild(canvas);
    }
    scene.background = new THREE.CubeTextureLoader().load(images);
  });
}
