import { KoruTSEngine } from "./core/engine";

let engine: KoruTSEngine;

// Initialize engine when the window loads
window.onload = function () {
  engine = new KoruTSEngine(320, 480);

  engine.start();
};
