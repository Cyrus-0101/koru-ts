import { gl, GLUtilities } from "./gl/gl";
import { Shader } from "./gl/shaders";

/**
 * KoruTSEngine - Core Game Engine Class
 *
 * Responsible for:
 * - Managing the game loop
 * - Handling WebGL context
 * - Managing shaders
 * - Controlling render pipeline
 * - Handling window resizing
 */
export class KoruTSEngine {
  /** Tracks frame count for debugging and performance monitoring */
  private _count: number = 0;

  /** Reference to the main canvas element where WebGL renders */
  private _canvas!: HTMLCanvasElement;

  /** Basic shader program for rendering */
  private _shader!: Shader;

  /**
   * Creates a new engine instance
   * Note: Actual initialization happens in start()
   */
  public constructor() {}

  /**
   * Initializes and starts the game engine
   * - Sets up WebGL context
   * - Configures initial render state
   * - Loads shader programs
   * - Begins the render loop
   */
  public start(): void {
    // Initialize WebGL context and get canvas reference
    this._canvas = GLUtilities.initialize();

    // Set default background color to black
    gl.clearColor(0, 0, 0, 1);

    // Load and activate shader programs
    this.loadShaders();
    this._shader.use();

    // Start the main game loop
    this.loop();
  }

  /**
   * Main game loop
   * Handles:
   * - Clearing the screen
   * - Rendering objects
   * - Scheduling next frame
   */
  private loop(): void {
    // Clear the canvas for next frame
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Schedule next frame
    requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * Handles window resize events
   * Adjusts canvas size to match window dimensions for proper display
   */
  public resize(): void {
    if (this._canvas !== undefined) {
      this._canvas.width = window.innerWidth;
      this._canvas.height = window.innerWidth;
    }
  }

  /**
   * Sets up basic shader programs
   * Creates and compiles:
   * - Vertex shader: Handles vertex positions
   * - Fragment shader: Sets pixel colors
   */
  private loadShaders(): void {
    // Basic vertex shader that transforms positions
    let vertexShaderSource = `
attribute vec3 a_position;

void main() {
    gl_Position = vec4(a_position, 1.0);
}`;

    // Basic fragment shader that outputs white color
    let fragmentShaderSource = `
precision mediump float;

void main() {
    gl_FragColor = vec4(1.0);
}
`;

    // Create new shader program with both shaders
    this._shader = new Shader(
      "basic",
      vertexShaderSource,
      fragmentShaderSource
    );
  }
}
