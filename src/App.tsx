import React, { useEffect, useRef } from "react";
import * as THREE from "three";

import { threeInit } from "./threescript/three.main";

interface MainIf {
  option?: {
    config?: {
      raderColor: string;
      sheildColor: string;
      raderPosition: string;
      sheildPosition: string;
    };
  };
}

function App(props: MainIf) {
  const threeContainer = useRef(null);
  const threeContext = useRef<ReturnType<typeof threeInit> | null>(null);
  useEffect(() => {
    if (threeContainer.current && !threeContext.current)
      threeContext.current = threeInit(threeContainer.current);
  });
  useEffect(() => {
    if (props.option && Object.keys(props.option.config).length) {
      let { config } = props.option!;
      threeContext.current?.setRader({
        center: new THREE.Vector3().fromArray(
          config!.raderPosition.split(",").map((e) => +e)
        ),
        color: new THREE.Color(config!.raderColor),
      });
      threeContext.current?.setSheild({
        center: new THREE.Vector3().fromArray(
          config!.sheildPosition.split(",").map((e) => +e)
        ),
        color: new THREE.Color(config!.sheildColor),
      });
    }
  }, [props.option]);

  return (
    <div className="App" style={{ height: "100%" }}>
      <div
        style={{ position: "relative", height: "100%" }}
        ref={threeContainer}
      ></div>
    </div>
  );
}

export default App;
