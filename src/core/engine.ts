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

  /** Container for data to be pushed in the graphics card, to be used in the vertex shader */
  private _buffer!: WebGLBuffer;

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

    this.createBuffer();

    this.resize();

    // Start the main game loop
    this.loop();
  }

  /**
   * Main game loop
   * Handles the rendering pipeline for each frame:
   * 1. Clear previous frame
   * 2. Bind vertex buffer
   * 3. Draw geometry
   * 4. Request next animation frame
   */
  private loop(): void {
    // Clear the color buffer to remove previous frame
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Bind our vertex buffer to the GL_ARRAY_BUFFER target
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(0);

    // Draw triangles using the bound buffer
    // Parameters: primitive type, starting offset, number of vertices
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Schedule next frame using requestAnimationFrame
    // bind(this) ensures correct 'this' context in the callback
    requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * Creates and initializes vertex buffer object (VBO)
   * Sets up a simple triangle in normalized device coordinates:
   * - Coordinates range from -1 to 1
   * - (0,0) is the center of the screen
   * - Each vertex has X, Y, Z components
   */
  private createBuffer(): void {
    // Create a new buffer object in GPU memory
    this._buffer = gl.createBuffer();

    // Define vertex data for a triangle
    // Each vertex is defined by 3 components (x, y, z)
    let vertices = [
      // x,   y,   z
      0.0,
      0.0,
      0.0, // Vertex 1: bottom-left
      0.0,
      0.5,
      0.0, // Vertex 2: top-left
      0.5,
      0.5,
      0.0, // Vertex 3: top-right
    ];

    // Bind the buffer to the GL_ARRAY_BUFFER target
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(0);

    // Upload vertex data to the buffer
    // Float32Array is used because GLSL expects 32-bit floats
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Unbind the buffer to prevent accidental modifications
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.disableVertexAttribArray(0);
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
      gl.viewport(0, 0, window.innerWidth, window.innerHeight);
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
