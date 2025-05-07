import { AssetManager } from "./assets/assetManager";
import { gl, GLUtilities } from "./gl/gl";
import { AttributeInfo, GLBuffer } from "./gl/glBuffer";
import { Shader } from "./gl/shaders";
import { BasicShader } from "./gl/shaders/basicShader";
import { Color } from "./graphics/color";
import { Material } from "./graphics/material";
import { MaterialManager } from "./graphics/materialManager";
import { Sprite } from "./graphics/sprite";
import { Matrix4x4 } from "./math/matrix4x4";
import { MessageBus } from "./message/messageBus";
import { fragmentShaderSource } from "./shaders/basic.frag";
import { vertexShaderSource } from "./shaders/basic.vert";
import { ZoneManager } from "./world/zoneManager";

/**
 * KoruTSEngine - Core Game Engine Class
 *
 * Responsibilities:
 * - Game loop management and frame timing
 * - WebGL context and canvas management
 * - Asset and material management
 * - Sprite rendering pipeline
 * - Window resize handling
 *
 * Architecture:
 * - Uses MessageBus for component communication
 * - Implements projection matrix for 2D rendering
 * - Manages material and texture resources
 * - Handles shader uniform updates
 *
 * Performance:
 * - Uses requestAnimationFrame for optimal timing
 * - Caches uniform locations
 * - Updates projection only on resize
 * - Manages frame synchronization
 * - Efficient sprite rendering
 */
export class KoruTSEngine {
  /** Counter for tracking frame updates and performance monitoring */
  private _count: number = 0;

  /** Canvas element where WebGL context is created and rendering occurs */
  private _canvas!: HTMLCanvasElement;

  /** Basic shader for 2D sprite rendering */
  private _basicShader!: BasicShader;

  /**
   * Orthographic projection matrix
   * Maps game world to screen coordinates
   */
  private _projection!: Matrix4x4;

  /**
   * Creates a new engine instance
   * Note: Actual initialization happens in start()
   */
  public constructor() {}

  /**
   * Initializes engine systems and starts game loop
   *
   * Process:
   * 1. Sets up WebGL context and canvas
   * 2. Initializes asset management
   * 3. Creates and configures shader programs
   * 4. Registers default materials
   * 5. Sets up projection matrix
   * 6. Sets up sprite
   * 7. Starts render loop
   */
  public start(): void {
    // Initialize WebGL context and get canvas reference
    this._canvas = GLUtilities.initialize();

    // Initialize AssetManager
    AssetManager.initiliaze();

    // Initialize ZoneManager
    ZoneManager.initialize();

    // Set default background color to black (R=0, G=0, B=0, A=1)
    gl.clearColor(0, 0, 0, 1);

    // Load and activate shader programs for rendering
    this._basicShader = new BasicShader();
    this._basicShader.use();

    // Register default material with blue tint
    MaterialManager.registerMaterial(
      new Material(
        "crate",
        "assets/textures/crate.jpg",
        new Color(0, 128, 255, 255)
      )
    );

    // Configure orthographic projection for 2D rendering
    this._projection = Matrix4x4.orthographic(
      0,
      this._canvas.width,
      this._canvas.height,
      0,
      -100.0,
      100.0
    );

    // TEMPORARY: TO-DO: Change this to read from a game config later
    ZoneManager.changeZone(0);

    // Configure initial viewport and canvas size
    this.resize();

    // Start the main game loop
    this.loop();
  }

  /**
   * Main game loop
   * Executes every frame (targeted 60fps)
   *
   * Process:
   * 1. Update message system
   * 2. Update active zone
   * 3. Clear previous frame
   * 4. Update projection uniforms
   * 5. Render current zone
   * 6. Schedule next frame
   */
  private loop(): void {
    // Update message system
    MessageBus.update(0);

    // Update active zone
    ZoneManager.update(0);

    // Clear the color buffer to remove previous frame
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set projection matrix uniform before rendering
    let projectionPosition =
      this._basicShader.getUniformLocation("u_projection");

    gl.uniformMatrix4fv(
      projectionPosition,
      false,
      new Float32Array(this._projection.data)
    );

    // Render active zone
    ZoneManager.render(this._basicShader);

    // Schedule next frame using requestAnimationFrame
    // bind(this) ensures correct 'this' context in the callback
    requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * Handles window resize events
   *
   * Updates:
   * - Canvas dimensions
   * - WebGL viewport
   * - Projection matrix
   *
   * Note: Called automatically on window resize
   */
  public resize(): void {
    if (this._canvas !== undefined) {
      this._canvas.width = window.innerWidth;
      this._canvas.height = window.innerHeight;

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      this._projection = Matrix4x4.orthographic(
        0,
        this._canvas.width,
        this._canvas.height,
        0,
        -100.0,
        100.0
      );
    }
  }
}
