import { gl, GLUtilities } from "./gl";

/**
 * Main game engine class that handles the game loop and core functionality
 */
export class KoruTSEngine {
  // Counter to track the number of frames/iterations
  private _count: number = 0;

  private _canvas: HTMLCanvasElement;

  /**
   * Initialize a new instance of the Engine
   */
  public constructor() {}

  /**
   * Starts the game engine by initiating the game loop
   */
  public start(): void {
    this._canvas = GLUtilities.initialize();

    gl.clearColor(0, 0, 0, 1);

    this.loop();
  }

  /**
   * Main game loop that runs every frame
   * Updates the document title with the current frame count
   * Uses requestAnimationFrame for smooth animation
   */
  private loop(): void {
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Request next frame and bind 'this' context to maintain scope
    requestAnimationFrame(this.loop.bind(this));
  }
}
