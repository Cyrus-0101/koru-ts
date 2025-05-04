import { gl, GLUtilities } from "./gl/gl";
import { AttributeInfo, GLBuffer } from "./gl/glBuffer";
import { Shader } from "./gl/shaders";
import { Sprite } from "./graphics/sprite";
import { Matrix4x4 } from "./math/matrix4x4";
import { fragmentShaderSource } from "./shaders/basic.frag";
import { vertexShaderSource } from "./shaders/basic.vert";

/**
 * KoruTSEngine - Core Game Engine Class
 *
 * Responsible for:
 * - Managing the game loop
 * - Handling WebGL context
 * - Resource loading and management
 * - Scene rendering and updates
 * - Window resizing
 *
 * WebGL References:
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
 */
export class KoruTSEngine {
  /** Counter for tracking frame updates and performance monitoring */
  private _count: number = 0;

  /** Canvas element where WebGL context is created and rendering occurs */
  private _canvas!: HTMLCanvasElement;

  /**
   * Shader program containing vertex and fragment shaders
   * Handles transformation and coloring of geometry
   */
  private _shader!: Shader;

  /** Sprite for rendering */
  private _sprite!: Sprite;

  /**
   * Projection matrix for transforming 3D coordinates to screen space
   * Configured as orthographic projection for 2D rendering
   * Maps world coordinates to normalized device coordinates (-1 to +1)
   */
  private _projection!: Matrix4x4;

  /**
   * Creates a new engine instance
   * Note: Actual initialization happens in start()
   */
  public constructor() {}

  /**
   * Initializes and starts the game engine
   * - Sets up WebGL context and canvas
   * - Shaders
   * - Initial game objects
   */
  public start(): void {
    // Initialize WebGL context and get canvas reference
    this._canvas = GLUtilities.initialize();

    // Set default background color to black (R=0, G=0, B=0, A=1)
    gl.clearColor(0, 0, 0, 1);

    // Load and activate shader programs for rendering
    this.loadShaders();
    this._shader.use();

    // Load matrix with params
    this._projection = Matrix4x4.orthographic(
      0,
      this._canvas.width,
      0,
      this._canvas.height,
      -100.0,
      100.0
    );

    // Create and load test sprite
    this._sprite = new Sprite("test");
    this._sprite.load();

    this._sprite.position.x = 200;
    // Configure initial viewport and canvas size
    this.resize();

    // Start the main game loop
    this.loop();
  }

  /**
   * Main game loop - Heart of the engine
   * Executes every frame (typically 60fps) and handles:
   * 1. Clear previous frame's render
   * 2 Object updates
   * 3 Rendering
   * 4. Schedule next frame
   */
  private loop(): void {
    // Clear the color buffer to remove previous frame
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set uniforms
    let colorPosition = this._shader.getUniformLocation("u_color");

    gl.uniform4f(colorPosition, 1, 0.5, 0, 1); // Orange color

    let projectionPosition = this._shader.getUniformLocation("u_projection");

    gl.uniformMatrix4fv(
      projectionPosition,
      false,
      new Float32Array(this._projection.data)
    );

    let modelLocation = this._shader.getUniformLocation("u_model");

    gl.uniformMatrix4fv(
      // Translate Z
      modelLocation,
      false,
      new Float32Array(Matrix4x4.translation(this._sprite.position).data)
    );

    // Draw Sprite
    this._sprite.draw();

    // Schedule next frame using requestAnimationFrame
    // bind(this) ensures correct 'this' context in the callback
    requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * Handles window resize events
   * Adjusts canvas size to match window dimensions for proper display
   */
  public resize(): void {
    if (this._canvas !== undefined) {
      this._canvas.width = window.innerWidth;
      this._canvas.height = window.innerHeight;

      // Normalized Device coordinates - how webGL represents triangles
      gl.viewport(-1, 1, -1, 1);
    }
  }

  /**
   * Sets up basic shader programs
   * Creates and compiles:
   * - Vertex shader: Handles vertex positions
   * - Fragment shader: Sets pixel colors
   */
  private loadShaders(): void {
    // Create new shader program with both shaders
    this._shader = new Shader(
      "basic",
      vertexShaderSource,
      fragmentShaderSource
    );
  }
}
