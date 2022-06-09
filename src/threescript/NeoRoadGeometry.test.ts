import * as THREE from "three";
import { roadPercentGenrator } from "./NeoRoadGeometry";

test("roadPercentGenrator", () => {
  expect(
    roadPercentGenrator(
      [1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0],
      [0, 1, 1, 2, 2, 3, 2, 4, 6, 5],
      1
    ).vertics
  ).toStrictEqual([
    1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 3, 0, 0, 5, 0, 0, 7, 0, 0, 6, 0, 0,
  ]);
});
