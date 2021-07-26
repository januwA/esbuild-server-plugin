import React, { useState } from "react";
import { render } from "react-dom";
import "./sty1";
import "./sty2";
import imgg from "./assert/i.jpg";

const Btn = () => {
  const [a, b] = useState(0);
  return <button onClick={() => b((p) => p + 1)}>clickme {a}</button>;
};

render(
  <div className="app">
    <h2>hello esbuild</h2>
    <img src={imgg} alt="" />
    <Btn></Btn>
  </div>,
  document.getElementById("root")
);
