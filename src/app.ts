import { KoruTSEngine } from "./core/engine";

let engine: KoruTSEngine;

// Initialize engine when the window loads
window.onload = function () {
  engine = new KoruTSEngine();

  engine.start();
};

// window.onresize = function () {
//   engine.resize();
// };
